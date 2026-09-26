import re
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update, and_, or_
from fastapi import HTTPException, status

from app.models import Group, GroupMember, GroupEvent, Student, Faculty, Event, User, AuditLog
from app.core.rbac import get_enforcer
from . import schema


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text or "group"


async def generate_unique_slug(db: AsyncSession, name: str, exclude_id: Optional[UUID] = None) -> str:
    base_slug = slugify(name)[:180]
    slug = base_slug
    counter = 2
    while True:
        query = select(Group.id).where(Group.slug == slug)
        if exclude_id:
            query = query.where(Group.id != exclude_id)
        result = await db.execute(query)
        if not result.scalar_one_or_none():
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


async def validate_faculty_advisor(db: AsyncSession, faculty_advisor_id: UUID) -> None:
    res = await db.execute(select(Faculty).where(Faculty.user_id == faculty_advisor_id))
    faculty = res.scalar_one_or_none()
    if faculty:
        return

    # Check Casbin / user
    user_res = await db.execute(select(User).where(User.id == faculty_advisor_id, User.deleted_at.is_(None)))
    user = user_res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Faculty advisor user not found")

    try:
        enforcer = get_enforcer()
        if enforcer:
            roles = await enforcer.get_implicit_roles_for_user(user.email)
            if any(r.lower() in ["faculty", "hod", "admin"] for r in roles):
                return
    except Exception:
        pass

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Faculty advisor must have Faculty role")


async def get_groups(
    db: AsyncSession,
    group_type: Optional[str] = None,
    category: Optional[str] = None,
    is_official: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    can_view_inactive: bool = False
) -> Tuple[List[Dict[str, Any]], int]:
    conditions = [Group.deleted_at.is_(None)]

    if not can_view_inactive:
        conditions.append(Group.is_active.is_(True))

    if group_type:
        conditions.append(Group.group_type == group_type)

    if category:
        conditions.append(Group.category == category)

    if is_official is not None:
        conditions.append(Group.is_official.is_(is_official))

    if search:
        search_filter = f"%{search.strip().lower()}%"
        conditions.append(or_(
            func.lower(Group.name).like(search_filter),
            func.lower(Group.tagline).like(search_filter),
            func.lower(Group.description).like(search_filter),
        ))

    count_stmt = select(func.count(Group.id)).where(and_(*conditions))
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    offset = (page - 1) * page_size
    query = (
        select(Group)
        .where(and_(*conditions))
        .order_by(Group.is_official.desc(), Group.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(query)
    groups = list(result.scalars().all())

    items = []
    for g in groups:
        # Count active members
        cnt_res = await db.execute(
            select(func.count(GroupMember.id)).where(
                GroupMember.group_id == g.id,
                GroupMember.is_active.is_(True)
            )
        )
        member_count = cnt_res.scalar_one()

        # Advisor name
        adv_name = None
        if g.faculty_advisor_id:
            u_res = await db.execute(select(User).where(User.id == g.faculty_advisor_id))
            u = u_res.scalar_one_or_none()
            adv_name = u.email.split("@")[0].title() if u else None

        # Lead name
        lead_name = None
        if g.student_lead_id:
            s_res = await db.execute(
                select(User.email)
                .join(Student, Student.user_id == User.id)
                .where(Student.id == g.student_lead_id)
            )
            lead_email = s_res.scalar_one_or_none()
            lead_name = lead_email.split("@")[0].replace(".", " ").title() if lead_email else None

        g_dict = {
            "id": g.id,
            "slug": g.slug,
            "name": g.name,
            "tagline": g.tagline,
            "description": g.description,
            "group_type": g.group_type,
            "category": g.category,
            "cover_image_url": g.cover_image_url,
            "logo_url": g.logo_url,
            "founded_on": g.founded_on,
            "faculty_advisor_id": g.faculty_advisor_id,
            "faculty_advisor_name": adv_name,
            "student_lead_id": g.student_lead_id,
            "student_lead_name": lead_name,
            "contact_email": g.contact_email,
            "contact_phone": g.contact_phone,
            "social_links": g.social_links or {},
            "meeting_schedule": g.meeting_schedule,
            "meeting_venue": g.meeting_venue,
            "membership_open": g.membership_open,
            "membership_fee": float(g.membership_fee or 0),
            "is_official": g.is_official,
            "is_active": g.is_active,
            "tags": g.tags or [],
            "member_count": member_count,
            "created_at": g.created_at,
            "updated_at": g.updated_at
        }
        items.append(g_dict)

    return items, total


async def get_group_by_slug(
    db: AsyncSession,
    slug: str,
    can_view_inactive: bool = False
) -> Dict[str, Any]:
    query = select(Group).where(Group.slug == slug, Group.deleted_at.is_(None))
    if not can_view_inactive:
        query = query.where(Group.is_active.is_(True))

    result = await db.execute(query)
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    # Fetch active members
    m_query = (
        select(GroupMember, Student.reg_no, User.email)
        .join(Student, GroupMember.student_id == Student.id)
        .join(User, Student.user_id == User.id)
        .where(GroupMember.group_id == group.id, GroupMember.is_active.is_(True))
        .order_by(
            # Order: lead first, core second, member third, pending last
            func.case(
                (GroupMember.role == "lead", 1),
                (GroupMember.role == "core", 2),
                (GroupMember.role == "member", 3),
                else_=4
            ),
            GroupMember.joined_at.asc()
        )
    )
    m_res = await db.execute(m_query)
    members_data = []
    for gm, reg_no, email in m_res.all():
        name = email.split("@")[0].replace(".", " ").title() if email else "Student"
        members_data.append({
            "id": gm.id,
            "group_id": gm.group_id,
            "student_id": gm.student_id,
            "student_name": name,
            "student_reg_no": reg_no,
            "student_email": email,
            "role": gm.role,
            "joined_at": gm.joined_at,
            "left_at": gm.left_at,
            "is_active": gm.is_active
        })

    # Fetch linked events
    e_query = (
        select(GroupEvent, Event.title, Event.slug, Event.start_datetime, Event.status)
        .join(Event, GroupEvent.event_id == Event.id)
        .where(GroupEvent.group_id == group.id, Event.deleted_at.is_(None))
        .order_by(Event.start_datetime.asc().nullslast())
    )
    e_res = await db.execute(e_query)
    events_data = []
    for ge, title, e_slug, start_dt, e_status in e_res.all():
        events_data.append({
            "id": ge.id,
            "group_id": ge.group_id,
            "event_id": ge.event_id,
            "event_title": title,
            "event_slug": e_slug,
            "start_datetime": start_dt,
            "status": e_status
        })

    # Advisor name
    adv_name = None
    if group.faculty_advisor_id:
        u_res = await db.execute(select(User).where(User.id == group.faculty_advisor_id))
        u = u_res.scalar_one_or_none()
        adv_name = u.email.split("@")[0].title() if u else None

    # Lead name
    lead_name = None
    if group.student_lead_id:
        s_res = await db.execute(
            select(User.email)
            .join(Student, Student.user_id == User.id)
            .where(Student.id == group.student_lead_id)
        )
        lead_email = s_res.scalar_one_or_none()
        lead_name = lead_email.split("@")[0].replace(".", " ").title() if lead_email else None

    return {
        "id": group.id,
        "slug": group.slug,
        "name": group.name,
        "tagline": group.tagline,
        "description": group.description,
        "group_type": group.group_type,
        "category": group.category,
        "cover_image_url": group.cover_image_url,
        "logo_url": group.logo_url,
        "founded_on": group.founded_on,
        "faculty_advisor_id": group.faculty_advisor_id,
        "faculty_advisor_name": adv_name,
        "student_lead_id": group.student_lead_id,
        "student_lead_name": lead_name,
        "contact_email": group.contact_email,
        "contact_phone": group.contact_phone,
        "social_links": group.social_links or {},
        "meeting_schedule": group.meeting_schedule,
        "meeting_venue": group.meeting_venue,
        "membership_open": group.membership_open,
        "membership_fee": float(group.membership_fee or 0),
        "is_official": group.is_official,
        "is_active": group.is_active,
        "tags": group.tags or [],
        "member_count": len(members_data),
        "members": members_data,
        "events": events_data,
        "created_at": group.created_at,
        "updated_at": group.updated_at
    }


async def create_group(
    db: AsyncSession,
    data: schema.GroupCreate,
    user: User
) -> Group:
    if data.faculty_advisor_id:
        await validate_faculty_advisor(db, data.faculty_advisor_id)

    if data.student_lead_id:
        s_res = await db.execute(select(Student).where(Student.id == data.student_lead_id))
        if not s_res.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student lead not found")

    slug = await generate_unique_slug(db, data.name)

    group = Group(
        slug=slug,
        name=data.name,
        tagline=data.tagline,
        description=data.description,
        group_type=data.group_type,
        category=data.category,
        cover_image_url=data.cover_image_url,
        logo_url=data.logo_url,
        founded_on=data.founded_on,
        faculty_advisor_id=data.faculty_advisor_id,
        student_lead_id=data.student_lead_id,
        contact_email=data.contact_email,
        contact_phone=data.contact_phone,
        social_links=data.social_links or {},
        meeting_schedule=data.meeting_schedule,
        meeting_venue=data.meeting_venue,
        membership_open=data.membership_open,
        membership_fee=data.membership_fee,
        is_official=False,
        is_active=True,
        tags=data.tags or [],
    )
    db.add(group)
    await db.flush()

    # If student lead is assigned on creation, add as lead member
    if data.student_lead_id:
        member = GroupMember(
            group_id=group.id,
            student_id=data.student_lead_id,
            role="lead",
            is_active=True
        )
        db.add(member)

    db.add(AuditLog(
        actor_id=user.id,
        action="create_group",
        resource_type="group",
        resource_id=str(group.id),
        payload={"name": group.name, "slug": group.slug, "category": group.category}
    ))
    await db.commit()
    await db.refresh(group)
    return group


async def update_group(
    db: AsyncSession,
    id: UUID,
    data: schema.GroupUpdate,
    user: User,
    is_admin_or_hod: bool
) -> Group:
    query = select(Group).where(Group.id == id, Group.deleted_at.is_(None))
    result = await db.execute(query)
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    is_advisor = group.faculty_advisor_id == user.id
    if not (is_admin_or_hod or is_advisor):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this group")

    update_dict = data.dict(exclude_unset=True)

    if "faculty_advisor_id" in update_dict and update_dict["faculty_advisor_id"]:
        await validate_faculty_advisor(db, update_dict["faculty_advisor_id"])

    if "name" in update_dict and update_dict["name"] != group.name:
        group.slug = await generate_unique_slug(db, update_dict["name"], exclude_id=group.id)

    for field, val in update_dict.items():
        setattr(group, field, val)

    group.updated_at = datetime.utcnow()

    db.add(AuditLog(
        actor_id=user.id,
        action="update_group",
        resource_type="group",
        resource_id=str(group.id),
        payload=update_dict
    ))
    await db.commit()
    await db.refresh(group)
    return group


async def delete_group(
    db: AsyncSession,
    id: UUID,
    user: User
) -> None:
    query = select(Group).where(Group.id == id, Group.deleted_at.is_(None))
    result = await db.execute(query)
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    group.deleted_at = datetime.utcnow()
    group.is_active = False

    db.add(AuditLog(
        actor_id=user.id,
        action="delete_group",
        resource_type="group",
        resource_id=str(group.id),
        payload={"slug": group.slug}
    ))
    await db.commit()


async def verify_group(
    db: AsyncSession,
    id: UUID,
    user: User
) -> Group:
    query = select(Group).where(Group.id == id, Group.deleted_at.is_(None))
    result = await db.execute(query)
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    group.is_official = True
    group.updated_at = datetime.utcnow()

    db.add(AuditLog(
        actor_id=user.id,
        action="verify_group",
        resource_type="group",
        resource_id=str(group.id),
        payload={"is_official": True}
    ))
    await db.commit()
    await db.refresh(group)
    return group


async def join_group(
    db: AsyncSession,
    group_id: UUID,
    user: User
) -> GroupMember:
    # Validate user is a student
    s_res = await db.execute(select(Student).where(Student.user_id == user.id))
    student = s_res.scalar_one_or_none()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can join groups"
        )

    # Check group
    g_res = await db.execute(select(Group).where(Group.id == group_id, Group.deleted_at.is_(None), Group.is_active.is_(True)))
    group = g_res.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found or inactive")

    if not group.membership_open:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Membership for this group is currently closed")

    # Check existing membership
    m_res = await db.execute(
        select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.student_id == student.id)
    )
    existing_member = m_res.scalar_one_or_none()
    if existing_member:
        if existing_member.is_active:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already a member of this group")
        else:
            # Reactivate
            existing_member.is_active = True
            existing_member.left_at = None
            existing_member.role = "pending" if (group.membership_fee and group.membership_fee > 0) else "member"
            existing_member.joined_at = datetime.utcnow()
            member = existing_member
    else:
        role = "pending" if (group.membership_fee and group.membership_fee > 0) else "member"
        member = GroupMember(
            group_id=group_id,
            student_id=student.id,
            role=role,
            is_active=True
        )
        db.add(member)

    db.add(AuditLog(
        actor_id=user.id,
        action="join_group",
        resource_type="group_member",
        resource_id=str(group_id),
        payload={"student_id": str(student.id), "role": member.role}
    ))
    await db.commit()
    await db.refresh(member)
    return member


async def leave_group(
    db: AsyncSession,
    group_id: UUID,
    user: User
) -> None:
    s_res = await db.execute(select(Student).where(Student.user_id == user.id))
    student = s_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student not found")

    m_res = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.student_id == student.id,
            GroupMember.is_active.is_(True)
        )
    )
    member = m_res.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active membership not found")

    was_lead = member.role == "lead"
    member.is_active = False
    member.left_at = datetime.utcnow()

    # Rule 3: If was lead, promote next core member
    if was_lead:
        # Look for next core member
        c_res = await db.execute(
            select(GroupMember)
            .where(
                GroupMember.group_id == group_id,
                GroupMember.is_active.is_(True),
                GroupMember.student_id != student.id,
                GroupMember.role == "core"
            )
            .order_by(GroupMember.joined_at.asc())
        )
        next_core = c_res.scalars().first()
        if next_core:
            next_core.role = "lead"
            await db.execute(
                update(Group).where(Group.id == group_id).values(student_lead_id=next_core.student_id)
            )
        else:
            # Check any member
            any_res = await db.execute(
                select(GroupMember)
                .where(
                    GroupMember.group_id == group_id,
                    GroupMember.is_active.is_(True),
                    GroupMember.student_id != student.id
                )
                .order_by(GroupMember.joined_at.asc())
            )
            next_mem = any_res.scalars().first()
            if next_mem:
                next_mem.role = "lead"
                await db.execute(
                    update(Group).where(Group.id == group_id).values(student_lead_id=next_mem.student_id)
                )
            else:
                await db.execute(
                    update(Group).where(Group.id == group_id).values(student_lead_id=None)
                )

    db.add(AuditLog(
        actor_id=user.id,
        action="leave_group",
        resource_type="group_member",
        resource_id=str(group_id),
        payload={"student_id": str(student.id), "was_lead": was_lead}
    ))
    await db.commit()


async def add_group_member(
    db: AsyncSession,
    group_id: UUID,
    data: schema.GroupMemberAdd,
    user: User,
    is_authorized: bool
) -> GroupMember:
    if not is_authorized:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add members")

    # Validate student
    s_res = await db.execute(select(Student).where(Student.id == data.student_id))
    if not s_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student not found")

    # Check existing
    m_res = await db.execute(
        select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.student_id == data.student_id)
    )
    existing = m_res.scalar_one_or_none()
    if existing and existing.is_active:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Student already a member")

    # Rule 1: Only one active lead per group
    if data.role == "lead":
        # Demote existing lead to core
        await db.execute(
            update(GroupMember)
            .where(
                GroupMember.group_id == group_id,
                GroupMember.role == "lead",
                GroupMember.is_active.is_(True)
            )
            .values(role="core")
        )
        await db.execute(
            update(Group).where(Group.id == group_id).values(student_lead_id=data.student_id)
        )

    if existing:
        existing.is_active = True
        existing.role = data.role or "member"
        existing.left_at = None
        existing.joined_at = datetime.utcnow()
        member = existing
    else:
        member = GroupMember(
            group_id=group_id,
            student_id=data.student_id,
            role=data.role or "member",
            is_active=True
        )
        db.add(member)

    db.add(AuditLog(
        actor_id=user.id,
        action="add_group_member",
        resource_type="group_member",
        resource_id=str(group_id),
        payload={"student_id": str(data.student_id), "role": member.role}
    ))
    await db.commit()
    await db.refresh(member)
    return member


async def update_member_role(
    db: AsyncSession,
    group_id: UUID,
    student_id: UUID,
    new_role: str,
    user: User,
    is_authorized: bool
) -> GroupMember:
    if not is_authorized:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update member roles")

    m_res = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.student_id == student_id,
            GroupMember.is_active.is_(True)
        )
    )
    member = m_res.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active group member not found")

    # Rule 1: Only one active lead per group
    if new_role == "lead":
        await db.execute(
            update(GroupMember)
            .where(
                GroupMember.group_id == group_id,
                GroupMember.role == "lead",
                GroupMember.is_active.is_(True),
                GroupMember.student_id != student_id
            )
            .values(role="core")
        )
        await db.execute(
            update(Group).where(Group.id == group_id).values(student_lead_id=student_id)
        )

    member.role = new_role

    db.add(AuditLog(
        actor_id=user.id,
        action="update_group_member_role",
        resource_type="group_member",
        resource_id=str(group_id),
        payload={"student_id": str(student_id), "new_role": new_role}
    ))
    await db.commit()
    await db.refresh(member)
    return member


async def get_group_members(db: AsyncSession, group_id: UUID) -> List[Dict[str, Any]]:
    m_query = (
        select(GroupMember, Student.reg_no, User.email)
        .join(Student, GroupMember.student_id == Student.id)
        .join(User, Student.user_id == User.id)
        .where(GroupMember.group_id == group_id, GroupMember.is_active.is_(True))
        .order_by(
            func.case(
                (GroupMember.role == "lead", 1),
                (GroupMember.role == "core", 2),
                (GroupMember.role == "member", 3),
                else_=4
            ),
            GroupMember.joined_at.asc()
        )
    )
    m_res = await db.execute(m_query)
    members = []
    for gm, reg_no, email in m_res.all():
        name = email.split("@")[0].replace(".", " ").title() if email else "Student"
        members.append({
            "id": gm.id,
            "group_id": gm.group_id,
            "student_id": gm.student_id,
            "student_name": name,
            "student_reg_no": reg_no,
            "student_email": email,
            "role": gm.role,
            "joined_at": gm.joined_at,
            "left_at": gm.left_at,
            "is_active": gm.is_active
        })
    return members


async def link_group_event(
    db: AsyncSession,
    group_id: UUID,
    event_id: UUID,
    user: User,
    is_authorized: bool
) -> GroupEvent:
    if not is_authorized:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to link events")

    # Check event exists
    e_res = await db.execute(select(Event).where(Event.id == event_id, Event.deleted_at.is_(None)))
    if not e_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    # Check existing link
    ge_res = await db.execute(
        select(GroupEvent).where(GroupEvent.group_id == group_id, GroupEvent.event_id == event_id)
    )
    existing = ge_res.scalar_one_or_none()
    if existing:
        return existing

    ge = GroupEvent(
        group_id=group_id,
        event_id=event_id
    )
    db.add(ge)

    db.add(AuditLog(
        actor_id=user.id,
        action="link_group_event",
        resource_type="group_event",
        resource_id=str(group_id),
        payload={"event_id": str(event_id)}
    ))
    await db.commit()
    await db.refresh(ge)
    return ge


async def get_my_groups(db: AsyncSession, user: User) -> List[Dict[str, Any]]:
    # Check student
    s_res = await db.execute(select(Student).where(Student.user_id == user.id))
    student = s_res.scalar_one_or_none()

    group_ids = set()
    if student:
        gm_res = await db.execute(
            select(GroupMember.group_id).where(GroupMember.student_id == student.id, GroupMember.is_active.is_(True))
        )
        for row in gm_res.all():
            group_ids.add(row[0])

    # Also check advisor groups
    adv_res = await db.execute(
        select(Group.id).where(Group.faculty_advisor_id == user.id, Group.deleted_at.is_(None))
    )
    for row in adv_res.all():
        group_ids.add(row[0])

    if not group_ids:
        return []

    groups_res = await db.execute(
        select(Group).where(Group.id.in_(list(group_ids)), Group.deleted_at.is_(None))
    )
    groups = groups_res.scalars().all()

    items = []
    for g in groups:
        cnt_res = await db.execute(
            select(func.count(GroupMember.id)).where(GroupMember.group_id == g.id, GroupMember.is_active.is_(True))
        )
        items.append({
            "id": g.id,
            "slug": g.slug,
            "name": g.name,
            "tagline": g.tagline,
            "description": g.description,
            "group_type": g.group_type,
            "category": g.category,
            "cover_image_url": g.cover_image_url,
            "logo_url": g.logo_url,
            "founded_on": g.founded_on,
            "faculty_advisor_id": g.faculty_advisor_id,
            "student_lead_id": g.student_lead_id,
            "contact_email": g.contact_email,
            "contact_phone": g.contact_phone,
            "social_links": g.social_links or {},
            "meeting_schedule": g.meeting_schedule,
            "meeting_venue": g.meeting_venue,
            "membership_open": g.membership_open,
            "membership_fee": float(g.membership_fee or 0),
            "is_official": g.is_official,
            "is_active": g.is_active,
            "tags": g.tags or [],
            "member_count": cnt_res.scalar_one(),
            "created_at": g.created_at,
            "updated_at": g.updated_at
        })
    return items


async def get_group_stats(db: AsyncSession) -> Dict[str, Any]:
    base_cond = and_(Group.deleted_at.is_(None), Group.is_active.is_(True))

    # By type
    type_query = select(Group.group_type, func.count(Group.id)).where(base_cond).group_by(Group.group_type)
    res_t = await db.execute(type_query)
    by_type = {row[0]: row[1] for row in res_t.all()}

    # By category
    cat_query = select(Group.category, func.count(Group.id)).where(base_cond).group_by(Group.category)
    res_c = await db.execute(cat_query)
    by_category = {row[0]: row[1] for row in res_c.all()}

    # Totals
    tot_query = select(
        func.count(Group.id),
        func.count(func.nullif(Group.is_official, False))
    ).where(base_cond)
    tot_res = await db.execute(tot_query)
    total_groups, total_official = tot_res.one()

    # Total members
    mem_query = select(func.count(GroupMember.id)).where(GroupMember.is_active.is_(True))
    mem_res = await db.execute(mem_query)
    total_members = mem_res.scalar_one()

    return {
        "by_type": by_type,
        "by_category": by_category,
        "total_groups": total_groups or 0,
        "total_official": total_official or 0,
        "total_members": total_members or 0
    }
