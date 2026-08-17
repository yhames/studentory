from datetime import date, time

import pytest
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from backend.app.crud import crud_student
from backend.app.exception import errors
from backend.app.model.student import DayOfWeek, StudentGender, StudentStage, StudentStatus
from backend.app.schema.student import StudentCreate, StudentScheduleCreate, StudentScheduleUpdate, StudentUpdate
from backend.app.service import student_service


@pytest.fixture
def session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as test_session:
        yield test_session


def test_create_get_list_and_update_student(session: Session) -> None:
    created = student_service.create_student(
        session,
        StudentCreate(
            name="  Mina  ",
            birth_year=2017,
            gender=StudentGender.FEMALE,
            stage=StudentStage.STAGE_1,
            status=StudentStatus.ACTIVE,
            special_notes="Needs review",
            request_notes=None,
        ),
    )

    assert created.id is not None
    student_id = created.id
    assert created.name == "Mina"
    assert created.birth_year == 2017
    assert created.gender == StudentGender.FEMALE
    assert created.age == date.today().year - 2017

    assert student_service.get_student(session, student_id).name == "Mina"
    assert [student.name for student in student_service.list_students(session)] == ["Mina"]

    updated = student_service.update_student(
        session,
        student_id,
        StudentUpdate(
            birth_year=2016,
            gender=StudentGender.MALE,
            stage=StudentStage.STAGE_2,
            request_notes="Use slower pace",
        ),
    )

    assert updated.stage == StudentStage.STAGE_2
    assert updated.birth_year == 2016
    assert updated.gender == StudentGender.MALE
    assert updated.request_notes == "Use slower pace"

    stage_six = student_service.update_student(
        session,
        student_id,
        StudentUpdate(stage=StudentStage.STAGE_6),
    )
    assert stage_six.stage == StudentStage.STAGE_6


def test_get_student_not_found(session: Session) -> None:
    with pytest.raises(errors.StudentNotFoundError):
        student_service.get_student(session, 999)


def test_delete_and_restore_student(session: Session) -> None:
    student_id = _create_student(session)

    student_service.delete_student(session, student_id)

    with pytest.raises(errors.StudentNotFoundError):
        student_service.get_student(session, student_id)
    assert student_service.list_students(session) == []
    assert crud_student.get_student(session, student_id) is None
    assert crud_student.get_student(session, student_id, include_deleted=True) is not None

    student_service.delete_student(session, student_id)

    restored = student_service.restore_student(session, student_id)

    assert restored.use_yn is True
    assert student_service.get_student(session, student_id).id == student_id


def test_create_list_and_update_student_schedule(session: Session) -> None:
    student_id = _create_student(session)

    schedule = student_service.create_student_schedule(
        session,
        student_id,
        StudentScheduleCreate(
            day_of_week=DayOfWeek.MONDAY,
            lesson_time=time(15, 30),
            effective_start_date=date(2026, 1, 1),
        ),
    )

    assert schedule.id is not None
    schedule_id = schedule.id
    assert schedule.student_id == student_id
    assert student_service.list_student_schedules(session, student_id)[0].day_of_week == DayOfWeek.MONDAY

    updated = student_service.update_student_schedule(
        session,
        student_id,
        schedule_id,
        StudentScheduleUpdate(day_of_week=DayOfWeek.TUESDAY, lesson_time=time(16, 30)),
    )

    assert updated.day_of_week == DayOfWeek.TUESDAY
    assert updated.lesson_time == time(16, 30)


def test_student_can_have_only_one_recurring_schedule(session: Session) -> None:
    student_id = _create_student(session)
    student_service.create_student_schedule(
        session,
        student_id,
        StudentScheduleCreate(
            day_of_week=DayOfWeek.MONDAY,
            lesson_time=time(15, 30),
            effective_start_date=date(2026, 1, 1),
        ),
    )

    with pytest.raises(errors.StudentScheduleValidationError):
        student_service.create_student_schedule(
            session,
            student_id,
            StudentScheduleCreate(
                day_of_week=DayOfWeek.WEDNESDAY,
                lesson_time=time(16, 30),
                effective_start_date=date(2026, 1, 1),
            ),
        )


def test_soft_deleted_schedule_is_excluded_from_normal_queries(session: Session) -> None:
    student_id = _create_student(session)
    schedule = student_service.create_student_schedule(
        session,
        student_id,
        StudentScheduleCreate(
            day_of_week=DayOfWeek.MONDAY,
            lesson_time=time(15, 30),
            effective_start_date=date(2026, 1, 1),
        ),
    )
    assert schedule.id is not None
    schedule_id = schedule.id

    schedule.use_yn = False
    session.add(schedule)
    session.commit()

    assert student_service.list_student_schedules(session, student_id) == []
    assert crud_student.get_student_schedule(session, schedule_id) is None
    with pytest.raises(errors.StudentScheduleNotFoundError):
        student_service.update_student_schedule(
            session,
            student_id,
            schedule_id,
            StudentScheduleUpdate(day_of_week=DayOfWeek.TUESDAY),
        )


def test_delete_student_schedule_soft_deletes_record(session: Session) -> None:
    student_id = _create_student(session)
    schedule = student_service.create_student_schedule(
        session,
        student_id,
        StudentScheduleCreate(
            day_of_week=DayOfWeek.MONDAY,
            lesson_time=time(15, 30),
            effective_start_date=date(2026, 1, 1),
        ),
    )
    assert schedule.id is not None
    schedule_id = schedule.id

    student_service.delete_student_schedule(session, student_id, schedule_id)
    student_service.delete_student_schedule(session, student_id, schedule_id)

    assert student_service.list_student_schedules(session, student_id) == []
    assert crud_student.get_student_schedule(session, schedule_id) is None
    with pytest.raises(errors.StudentScheduleNotFoundError):
        student_service.update_student_schedule(
            session,
            student_id,
            schedule_id,
            StudentScheduleUpdate(day_of_week=DayOfWeek.TUESDAY),
        )


def test_schedule_update_requires_existing_schedule(session: Session) -> None:
    student_id = _create_student(session)

    with pytest.raises(errors.StudentScheduleNotFoundError):
        student_service.update_student_schedule(
            session,
            student_id,
            999,
            StudentScheduleUpdate(day_of_week=DayOfWeek.TUESDAY),
        )


def test_schedule_ownership_mismatch(session: Session) -> None:
    first_student_id = _create_student(session, name="First")
    second_student_id = _create_student(session, name="Second")
    schedule = student_service.create_student_schedule(
        session,
        first_student_id,
        StudentScheduleCreate(
            day_of_week=DayOfWeek.FRIDAY,
            lesson_time=time(18, 0),
            effective_start_date=date(2026, 1, 1),
        ),
    )

    with pytest.raises(errors.StudentScheduleOwnershipError):
        assert schedule.id is not None
        student_service.update_student_schedule(
            session,
            second_student_id,
            schedule.id,
            StudentScheduleUpdate(day_of_week=DayOfWeek.TUESDAY),
        )


def _create_student(session: Session, name: str = "Mina") -> int:
    student = student_service.create_student(
        session,
        StudentCreate(
            name=name,
            birth_year=2017,
            gender=StudentGender.FEMALE,
            stage=StudentStage.STAGE_1,
            status=StudentStatus.ACTIVE,
        ),
    )
    assert student.id is not None
    return student.id
