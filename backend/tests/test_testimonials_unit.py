import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from datetime import datetime
from fastapi import HTTPException

from app.modules.testimonials.service import (
    detect_author_info,
    get_testimonials,
    get_pending_testimonials,
    get_testimonial_by_id,
    create_testimonial,
    update_testimonial,
    delete_testimonial,
    approve_testimonial,
    reject_testimonial,
    feature_testimonial,
    get_testimonial_stats
)
from app.modules.testimonials import schema
from app.modules.testimonials import router as test_router
from app.models import Testimonial, Student, Alumni, Faculty, User


def test_testimonial_schemas_and_sanitization():
    # Test HTML sanitization
    raw = "Amazing department! <script>alert('hack')</script> Highly recommended <b>5 stars</b>."
    data = schema.TestimonialCreate(
        text=raw,
        rating=5,
        context="about_department"
    )
    assert "<script>" not in data.text
    assert "<b>" not in data.text
    assert "Amazing department! alert('hack') Highly recommended 5 stars." in data.text

    # Max length > 500 characters fails
    with pytest.raises(ValueError):
        schema.TestimonialCreate(text="A" * 501)

    # Empty text fails
    with pytest.raises(ValueError):
        schema.TestimonialCreate(text="<p></p>")


@pytest.mark.asyncio
async def test_detect_author_info():
    db = AsyncMock()
    user_id = uuid4()
    user = User(id=user_id, email="student.one@aiml.hub")

    # Case 1: Student
    st_mock = Student(id=uuid4(), user_id=user_id, reg_no="RA2111003010099")
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=st_mock))
    atype, aname, arole = await detect_author_info(db, user)
    assert atype == "student"
    assert "Student" in aname
    assert "RA2111003010099" in arole

    # Case 2: Alumni
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)), # student None
        MagicMock(scalar_one_or_none=MagicMock(return_value=Alumni(id=uuid4(), full_name="Pooja Rao", current_role="ML Engineer")))
    ]
    atype_al, aname_al, arole_al = await detect_author_info(db, user)
    assert atype_al == "alumni"
    assert aname_al == "Pooja Rao"
    assert arole_al == "ML Engineer"

    # Case 3: Faculty
    user_fc = User(id=uuid4(), email="dr.rao@aiml.hub")
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=Faculty(id=uuid4(), user_id=user_fc.id, designation="Professor")))
    ]
    atype_fc, aname_fc, arole_fc = await detect_author_info(db, user_fc)
    assert atype_fc == "faculty"
    assert "Dr Rao" in aname_fc
    assert arole_fc == "Professor"


@pytest.mark.asyncio
async def test_create_and_submit_testimonial():
    db = AsyncMock()
    user = User(id=uuid4(), email="ravi.student@aiml.hub")

    # Mock student detect
    st_mock = Student(id=uuid4(), user_id=user.id, reg_no="RA2111003010055")
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=st_mock))

    data = schema.TestimonialCreate(
        text="The professors are world class and guided my research.",
        rating=5,
        context="about_faculty"
    )

    t = await create_testimonial(db, data, user)
    assert t.author_type == "student"
    assert t.is_published is False # Pending moderation
    assert t.rating == 5
    assert t.context == "about_faculty"


@pytest.mark.asyncio
async def test_approve_and_reject_testimonial():
    db = AsyncMock()
    admin_user = User(id=uuid4(), email="admin@aiml.hub")
    t = Testimonial(
        id=uuid4(),
        author_name="Ravi",
        author_type="student",
        text="Great college",
        is_published=False
    )
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=t))

    approved = await approve_testimonial(db, t.id, admin_user)
    assert approved.is_published is True
    assert approved.moderated_by == admin_user.id
    assert approved.moderated_at is not None

    rejected = await reject_testimonial(db, t.id, admin_user, reason="Contains non-academic remarks")
    assert rejected.is_published is False


@pytest.mark.asyncio
async def test_feature_testimonial_limit_auto_unfeature():
    db = AsyncMock()
    admin_user = User(id=uuid4(), email="admin@aiml.hub")
    t_new = Testimonial(id=uuid4(), context="about_department", is_featured=False)

    old_featured = [
        Testimonial(id=uuid4(), context="about_department", is_featured=True),
        Testimonial(id=uuid4(), context="about_department", is_featured=True),
        Testimonial(id=uuid4(), context="about_department", is_featured=True)
    ]

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=t_new)), # get by id
        MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=old_featured)))) # existing featured
    ]

    featured = await feature_testimonial(db, t_new.id, admin_user)
    assert featured.is_featured is True
    # The oldest (3rd item) was un-featured to maintain limit of 3
    assert old_featured[2].is_featured is False


@pytest.mark.asyncio
async def test_get_testimonials_and_stats():
    db = AsyncMock()
    items_mock = [Testimonial(id=uuid4(), text="Great place", author_type="student", is_published=True)]

    db.execute.side_effect = [
        MagicMock(scalar_one=MagicMock(return_value=1)), # count
        MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=items_mock)))) # items
    ]
    items, total = await get_testimonials(
        db=db,
        author_type="student",
        context="about_department",
        featured=True,
        page=1,
        page_size=10
    )
    assert total == 1
    assert len(items) == 1

    # Pending
    db.execute.side_effect = [
        MagicMock(scalar_one=MagicMock(return_value=1)),
        MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=items_mock))))
    ]
    p_items, p_total = await get_pending_testimonials(db, page=1, page_size=10)
    assert p_total == 1

    # Stats
    db.execute.side_effect = [
        MagicMock(all=MagicMock(return_value=[("student", 10), ("alumni", 5)])), # type
        MagicMock(all=MagicMock(return_value=[("about_department", 4.8)])),       # ratings
        MagicMock(one=MagicMock(return_value=(15, 12, 3)))                        # totals
    ]
    stats = await get_testimonial_stats(db)
    assert stats["total_testimonials"] == 15
    assert stats["total_published"] == 12
    assert stats["total_pending"] == 3


@pytest.mark.asyncio
async def test_update_and_delete_testimonial():
    db = AsyncMock()
    user = User(id=uuid4(), email="author@aiml.hub")
    t = Testimonial(id=uuid4(), author_id=user.id, text="Initial text", is_published=False)

    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=t))
    up = await update_testimonial(db, t.id, schema.TestimonialUpdate(text="Updated text"), user, is_admin_or_hod=False)
    assert up.text == "Updated text"

    await delete_testimonial(db, t.id, user, is_admin_or_hod=False)
    assert t.deleted_at is not None


@pytest.mark.asyncio
async def test_testimonial_router_endpoints():
    user = User(id=uuid4(), email="student@aiml.hub")
    hod = User(id=uuid4(), email="hod@aiml.hub")
    db = AsyncMock()
    t_obj = Testimonial(id=uuid4(), author_name="User", author_type="student", text="Test", is_published=True)

    with patch("app.modules.testimonials.router._get_role", return_value="student"):
        # List
        with patch("app.modules.testimonials.service.get_testimonials", return_value=([], 0)):
            res_list = await test_router.list_testimonials(db=db, current_user=user)
            assert res_list["total"] == 0

        # Stats
        with patch("app.modules.testimonials.service.get_testimonial_stats", return_value={"by_author_type": {}, "avg_rating_by_context": {}, "total_testimonials": 0, "total_published": 0, "total_pending": 0}):
            res_stats = await test_router.get_testimonials_stats(db=db)
            assert res_stats["total_testimonials"] == 0

        # Get by id
        with patch("app.modules.testimonials.service.get_testimonial_by_id", return_value=t_obj):
            res_get = await test_router.get_testimonial(id=t_obj.id, db=db, current_user=user)
            assert res_get.text == "Test"

        # Create
        with patch("app.modules.testimonials.service.create_testimonial", return_value=t_obj):
            res_cr = await test_router.create_testimonial(
                data=schema.TestimonialCreate(text="Nice college"),
                db=db,
                current_user=user
            )
            assert res_cr.text == "Test"

        # Update
        with patch("app.modules.testimonials.service.update_testimonial", return_value=t_obj):
            res_up = await test_router.update_testimonial(
                id=t_obj.id,
                data=schema.TestimonialUpdate(text="Updated"),
                db=db,
                current_user=user
            )
            assert res_up.text == "Test"

        # Delete
        with patch("app.modules.testimonials.service.delete_testimonial", return_value=None):
            await test_router.delete_testimonial(id=t_obj.id, db=db, current_user=user)

        # Student cannot approve
        with pytest.raises(HTTPException) as exc_app:
            await test_router.approve_testimonial(id=t_obj.id, db=db, current_user=user)
        assert exc_app.value.status_code == 403

        # Student cannot view pending queue
        with pytest.raises(HTTPException) as exc_pen:
            await test_router.get_pending_testimonials(db=db, current_user=user)
        assert exc_pen.value.status_code == 403

    # HOD actions
    with patch("app.modules.testimonials.router._get_role", return_value="hod"):
        with patch("app.modules.testimonials.service.get_pending_testimonials", return_value=([], 0)):
            res_pend = await test_router.get_pending_testimonials(db=db, current_user=hod)
            assert res_pend["total"] == 0

        with patch("app.modules.testimonials.service.approve_testimonial", return_value=t_obj):
            res_app = await test_router.approve_testimonial(id=t_obj.id, db=db, current_user=hod)
            assert res_app.text == "Test"

        with patch("app.modules.testimonials.service.reject_testimonial", return_value=t_obj):
            res_rej = await test_router.reject_testimonial(id=t_obj.id, body=schema.TestimonialReject(reason="Rejection"), db=db, current_user=hod)
            assert res_rej.text == "Test"

        with patch("app.modules.testimonials.service.feature_testimonial", return_value=t_obj):
            res_feat = await test_router.feature_testimonial(id=t_obj.id, db=db, current_user=hod)
            assert res_feat.text == "Test"
