from datetime import date

from sqlalchemy import or_
from sqlmodel import Session, col, select

from backend.app.model.lesson import AttendanceStatus, Lesson, LessonStatus, PreparationStatus
from backend.app.model.student import Student, StudentSchedule, StudentStatus


def get_lessons(
    session: Session,
    date_from: date,
    date_to: date,
    *,
    student_id: int | None = None,
    lesson_status: LessonStatus | None = None,
    preparation_status: PreparationStatus | None = None,
    attendance_status: AttendanceStatus | None = None,
) -> list[Lesson]:
    statement = (
        select(Lesson)
        .join(Student, col(Student.id) == col(Lesson.student_id))
        .outerjoin(StudentSchedule, col(StudentSchedule.id) == col(Lesson.schedule_id))
        .where(
            col(Lesson.use_yn).is_(True),
            col(Student.use_yn).is_(True),
            or_(col(Lesson.schedule_id).is_(None), col(StudentSchedule.use_yn).is_(True)),
            Lesson.lesson_date >= date_from,
            Lesson.lesson_date <= date_to,
        )
    )
    if student_id is not None:
        statement = statement.where(Lesson.student_id == student_id)
    if lesson_status is not None:
        statement = statement.where(Lesson.lesson_status == lesson_status)
    if preparation_status is not None:
        statement = statement.where(Lesson.preparation_status == preparation_status)
    if attendance_status is not None:
        statement = statement.where(Lesson.attendance_status == attendance_status)
    statement = statement.order_by(col(Lesson.lesson_date), col(Lesson.lesson_time), col(Lesson.id))
    return list(session.exec(statement).all())


def get_lesson(session: Session, lesson_id: int, *, include_deleted: bool = False) -> Lesson | None:
    statement = (
        select(Lesson)
        .join(Student, col(Student.id) == col(Lesson.student_id))
        .outerjoin(StudentSchedule, col(StudentSchedule.id) == col(Lesson.schedule_id))
        .where(
            Lesson.id == lesson_id,
            col(Student.use_yn).is_(True),
            or_(col(Lesson.schedule_id).is_(None), col(StudentSchedule.use_yn).is_(True)),
        )
    )
    if not include_deleted:
        statement = statement.where(col(Lesson.use_yn).is_(True))
    return session.exec(statement).one_or_none()


def get_generation_schedules(session: Session) -> list[tuple[StudentSchedule, Student]]:
    statement = (
        select(StudentSchedule, Student)
        .join(Student, col(Student.id) == col(StudentSchedule.student_id))
        .where(
            col(StudentSchedule.use_yn).is_(True),
            col(Student.use_yn).is_(True),
            Student.status == StudentStatus.ACTIVE,
        )
        .order_by(col(StudentSchedule.id))
    )
    return list(session.exec(statement).all())


def get_existing_schedule_dates(
    session: Session,
    schedule_ids: list[int],
    date_from: date,
    date_to: date,
) -> set[tuple[int, date]]:
    if not schedule_ids:
        return set()
    statement = select(col(Lesson.schedule_id), col(Lesson.lesson_date)).where(
        col(Lesson.schedule_id).in_(schedule_ids),
        Lesson.lesson_date >= date_from,
        Lesson.lesson_date <= date_to,
    )
    return {
        (schedule_id, lesson_date)
        for schedule_id, lesson_date in session.exec(statement).all()
        if schedule_id is not None
    }


def create_lesson(session: Session, lesson: Lesson, *, commit: bool = True) -> Lesson:
    session.add(lesson)
    if commit:
        session.commit()
        session.refresh(lesson)
    return lesson


def create_lessons(session: Session, lessons: list[Lesson]) -> list[Lesson]:
    session.add_all(lessons)
    session.commit()
    for lesson in lessons:
        session.refresh(lesson)
    return lessons


def update_lesson(session: Session, lesson: Lesson, values: dict[str, object]) -> Lesson:
    for field, value in values.items():
        setattr(lesson, field, value)
    lesson.touch()
    session.add(lesson)
    session.commit()
    session.refresh(lesson)
    return lesson


def soft_delete_lesson(session: Session, lesson: Lesson) -> None:
    lesson.use_yn = False
    lesson.touch()
    session.add(lesson)
    session.commit()
