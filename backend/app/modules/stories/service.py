import re
import json
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update, and_, or_, text
from fastapi import HTTPException, status

from app.models import SuccessStory, Student, Alumni, User, AuditLog
from app.core.redis import get_redis
from . import schema


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text or "story"


async def generate_unique_slug(db: AsyncSession, title: str, exclude_id: Optional[UUID] = None) -> str:
    base_slug = slugify(title)[:280]
    slug = base_slug
    counter = 2
    while True:
        query = select(SuccessStory.id).where(SuccessStory.slug == slug)
        if exclude_id:
            query = query.where(SuccessStory.id != exclude_id)
        result = await db.execute(query)
        if not result.scalar_one_or_none():
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


async def validate_person(db: AsyncSession, story_type: str, person_id: UUID) -> Tuple[Optional[str], Optional[str]]:
    """Validate that the person exists in students or alumni, and return their name/role if denormalizable."""
    if story_type == "student":
        res = await db.execute(select(Student).where(Student.id == person_id))
        student = res.scalar_one_or_none()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Student with id {person_id} does not exist"
            )
        # Fetch user name if available
        user_res = await db.execute(select(User).where(User.id == student.user_id))
        user = user_res.scalar_one_or_none()
        name = user.email.split("@")[0].replace(".", " ").title() if user else None
        return name, "Student"
    elif story_type == "alumni":
        res = await db.execute(select(Alumni).where(Alumni.id == person_id, Alumni.deleted_at.is_(None)))
        alumni = res.scalar_one_or_none()
        if not alumni:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Alumni with id {person_id} does not exist"
            )
        return alumni.full_name, alumni.current_role
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="story_type must be either 'student' or 'alumni'"
        )


async def get_stories(
    db: AsyncSession,
    story_type: Optional[str] = None,
    batch_year: Optional[int] = None,
    tag: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    can_view_unpublished: bool = False
) -> Tuple[List[SuccessStory], int]:
    conditions = [SuccessStory.deleted_at.is_(None)]

    if not can_view_unpublished:
        conditions.append(SuccessStory.is_published.is_(True))

    if story_type:
        conditions.append(SuccessStory.story_type == story_type)

    if batch_year:
        conditions.append(SuccessStory.batch_year == batch_year)

    if featured is not None:
        conditions.append(SuccessStory.featured.is_(featured))

    if tag:
        conditions.append(SuccessStory.tags.contains([tag]))

    if search:
        search_filter = f"%{search.strip().lower()}%"
        conditions.append(or_(
            func.lower(SuccessStory.title).like(search_filter),
            func.lower(SuccessStory.subtitle).like(search_filter),
            func.lower(SuccessStory.summary).like(search_filter),
            func.lower(SuccessStory.person_name).like(search_filter),
            func.lower(SuccessStory.current_company).like(search_filter),
        ))

    # Total count
    count_stmt = select(func.count(SuccessStory.id)).where(and_(*conditions))
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    # Query with sorting: featured first, then published_at DESC, then created_at DESC
    offset = (page - 1) * page_size
    query = (
        select(SuccessStory)
        .where(and_(*conditions))
        .order_by(
            SuccessStory.featured.desc(),
            SuccessStory.published_at.desc().nullslast(),
            SuccessStory.created_at.desc()
        )
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(query)
    items = list(result.scalars().all())

    return items, total


async def get_story_by_slug(
    db: AsyncSession,
    slug: str,
    can_view_unpublished: bool = False
) -> SuccessStory:
    query = select(SuccessStory).where(
        SuccessStory.slug == slug,
        SuccessStory.deleted_at.is_(None)
    )
    if not can_view_unpublished:
        query = query.where(SuccessStory.is_published.is_(True))

    result = await db.execute(query)
    story = result.scalar_one_or_none()
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Success story not found")

    # Increment view count via raw SQL (no lock contention)
    await db.execute(
        text("UPDATE success_stories SET views_count = views_count + 1 WHERE id = :id"),
        {"id": story.id}
    )
    await db.commit()
    story.views_count += 1

    return story


async def create_story(
    db: AsyncSession,
    data: schema.StoryCreate,
    user: User
) -> SuccessStory:
    default_name, default_role = await validate_person(db, data.story_type, data.person_id)

    slug = await generate_unique_slug(db, data.title)

    story = SuccessStory(
        slug=slug,
        title=data.title,
        subtitle=data.subtitle,
        story_type=data.story_type,
        person_id=data.person_id,
        person_name=data.person_name or default_name,
        person_photo_url=data.person_photo_url,
        current_role=data.current_role or default_role,
        current_company=data.current_company,
        batch_year=data.batch_year,
        program=data.program,
        summary=data.summary,
        full_story=data.full_story,
        featured_image_url=data.featured_image_url,
        video_url=data.video_url,
        tags=data.tags or [],
        is_published=False,
        created_by=user.id,
    )
    db.add(story)
    await db.flush()

    # Audit log
    db.add(AuditLog(
        actor_id=user.id,
        action="create_success_story",
        resource_type="success_story",
        resource_id=str(story.id),
        payload={"title": story.title, "slug": story.slug, "story_type": story.story_type}
    ))
    await db.commit()
    await db.refresh(story)
    return story


async def update_story(
    db: AsyncSession,
    story_id: UUID,
    data: schema.StoryUpdate,
    user: User,
    is_admin_or_hod: bool
) -> SuccessStory:
    query = select(SuccessStory).where(SuccessStory.id == story_id, SuccessStory.deleted_at.is_(None))
    result = await db.execute(query)
    story = result.scalar_one_or_none()
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Success story not found")

    if not is_admin_or_hod and story.created_by != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this story")

    update_dict = data.dict(exclude_unset=True)

    if "person_id" in update_dict or "story_type" in update_dict:
        st_type = update_dict.get("story_type", story.story_type)
        p_id = update_dict.get("person_id", story.person_id)
        await validate_person(db, st_type, p_id)

    if "title" in update_dict and update_dict["title"] != story.title:
        story.slug = await generate_unique_slug(db, update_dict["title"], exclude_id=story.id)

    for field, val in update_dict.items():
        setattr(story, field, val)

    story.updated_at = datetime.utcnow()

    db.add(AuditLog(
        actor_id=user.id,
        action="update_success_story",
        resource_type="success_story",
        resource_id=str(story.id),
        payload=update_dict
    ))
    await db.commit()
    await db.refresh(story)
    return story


async def delete_story(
    db: AsyncSession,
    story_id: UUID,
    user: User,
    is_admin_or_hod: bool
) -> None:
    query = select(SuccessStory).where(SuccessStory.id == story_id, SuccessStory.deleted_at.is_(None))
    result = await db.execute(query)
    story = result.scalar_one_or_none()
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Success story not found")

    if not is_admin_or_hod and story.created_by != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this story")

    story.deleted_at = datetime.utcnow()

    db.add(AuditLog(
        actor_id=user.id,
        action="delete_success_story",
        resource_type="success_story",
        resource_id=str(story.id),
        payload={"slug": story.slug}
    ))
    await db.commit()


async def publish_story(
    db: AsyncSession,
    story_id: UUID,
    user: User,
    is_admin_or_hod: bool
) -> SuccessStory:
    query = select(SuccessStory).where(SuccessStory.id == story_id, SuccessStory.deleted_at.is_(None))
    result = await db.execute(query)
    story = result.scalar_one_or_none()
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Success story not found")

    if not is_admin_or_hod and story.created_by != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to publish this story")

    story.is_published = True
    story.published_at = datetime.utcnow()
    story.updated_at = datetime.utcnow()

    db.add(AuditLog(
        actor_id=user.id,
        action="publish_success_story",
        resource_type="success_story",
        resource_id=str(story.id),
        payload={"published_at": story.published_at.isoformat()}
    ))
    await db.commit()
    await db.refresh(story)
    return story


async def feature_story(
    db: AsyncSession,
    story_id: UUID,
    user: User
) -> SuccessStory:
    query = select(SuccessStory).where(SuccessStory.id == story_id, SuccessStory.deleted_at.is_(None))
    result = await db.execute(query)
    story = result.scalar_one_or_none()
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Success story not found")

    if not story.featured:
        # Un-feature any other story of same story_type
        await db.execute(
            update(SuccessStory)
            .where(
                SuccessStory.story_type == story.story_type,
                SuccessStory.featured.is_(True),
                SuccessStory.id != story.id
            )
            .values(featured=False)
        )
        story.featured = True
    else:
        story.featured = False

    story.updated_at = datetime.utcnow()

    db.add(AuditLog(
        actor_id=user.id,
        action="feature_success_story",
        resource_type="success_story",
        resource_id=str(story.id),
        payload={"featured": story.featured, "story_type": story.story_type}
    ))
    await db.commit()
    await db.refresh(story)
    return story


async def get_story_stats(db: AsyncSession) -> Dict[str, Any]:
    redis = await get_redis()
    cache_key = "stories:stats"
    if redis:
        try:
            cached = await redis.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception:
            pass

    # Compute stats
    base_cond = SuccessStory.deleted_at.is_(None)

    # By type
    type_query = (
        select(SuccessStory.story_type, func.count(SuccessStory.id))
        .where(base_cond)
        .group_by(SuccessStory.story_type)
    )
    type_res = await db.execute(type_query)
    by_type = {row[0]: row[1] for row in type_res.all()}

    # By batch
    batch_query = (
        select(SuccessStory.batch_year, func.count(SuccessStory.id))
        .where(base_cond, SuccessStory.batch_year.isnot(None))
        .group_by(SuccessStory.batch_year)
    )
    batch_res = await db.execute(batch_query)
    by_batch = {str(row[0]): row[1] for row in batch_res.all()}

    # Overall totals
    totals_query = select(
        func.count(SuccessStory.id),
        func.count(func.nullif(SuccessStory.is_published, False)),
        func.coalesce(func.sum(SuccessStory.views_count), 0)
    ).where(base_cond)
    tot_res = await db.execute(totals_query)
    total_stories, total_published, total_views = tot_res.one()

    data = {
        "by_type": by_type,
        "by_batch": by_batch,
        "total_stories": total_stories or 0,
        "total_published": total_published or 0,
        "total_views": int(total_views or 0)
    }

    if redis:
        try:
            await redis.set(cache_key, json.dumps(data), ex=600)
        except Exception:
            pass

    return data
