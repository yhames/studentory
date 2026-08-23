from datetime import date, timedelta

from sqlmodel import Session

from backend.app.crud import crud_lesson, crud_student
from backend.app.exception.errors import LessonNotFoundError, LessonValidationError, StudentNotFoundError
from backend.app.model.lesson import AttendanceStatus, Lesson, LessonStatus, PreparationStatus
from backend.app.model.student import DayOfWeek
from backend.app.schema.lesson import LessonCreate, LessonGenerateRequest, LessonUpdate

DAY_INDEX = {day: index for index, day in enumerate(DayOfWeek)}


def list_lessons(
    session: Session,
    date_from: date,
    date_to: date,
    *,
    student_id: int | None = None,
    lesson_status: LessonStatus | None = None,
    preparation_status: PreparationStatus | None = None,
    attendance_status: AttendanceStatus | None = None,
) -> list[Lesson]:
    _validate_range(date_from, date_to)
    return crud_lesson.get_lessons(
        session,
        date_from,
        date_to,
        student_id=student_id,
        lesson_status=lesson_status,
        preparation_status=preparation_status,
        attendance_status=attendance_status,
    )


def generate_lessons(session: Session, data: LessonGenerateRequest) -> int:
    _validate_range(data.date_from, data.date_to, maximum_days=7)
    schedules = crud_lesson.get_generation_schedules(session)
    schedule_ids = [schedule.id for schedule, _ in schedules if schedule.id is not None]
    existing = crud_lesson.get_existing_schedule_dates(session, schedule_ids, data.date_from, data.date_to)
    lessons: list[Lesson] = []
    for schedule, _student in schedules:
        if schedule.id is None:
            continue
        lesson_date = data.date_from
        while lesson_date <= data.date_to:
            key = (schedule.id, lesson_date)
            if (
                lesson_date >= schedule.effective_start_date
                and lesson_date.weekday() == DAY_INDEX[schedule.day_of_week]
                and key not in existing
            ):
                lessons.append(
                    Lesson(
                        student_id=schedule.student_id,
                        schedule_id=schedule.id,
                        lesson_date=lesson_date,
                        lesson_time=schedule.lesson_time,
                    )
                )
                existing.add(key)
            lesson_date += timedelta(days=1)
    if lessons:
        crud_lesson.create_lessons(session, lessons)
    return len(lessons)


def create_lesson(session: Session, data: LessonCreate) -> Lesson:
    if crud_student.get_student(session, data.student_id) is None:
        raise StudentNotFoundError
    return crud_lesson.create_lesson(session, Lesson(**data.model_dump()))


def get_lesson(session: Session, lesson_id: int) -> Lesson:
    lesson = crud_lesson.get_lesson(session, lesson_id)
    if lesson is None:
        raise LessonNotFoundError
    return lesson


def update_lesson(session: Session, lesson_id: int, data: LessonUpdate) -> Lesson:
    lesson = get_lesson(session, lesson_id)
    values = data.model_dump(exclude_unset=True)
    if ("lesson_date" in values or "lesson_time" in values) and lesson.schedule_id is not None:
        raise LessonValidationError("Recurring lessons cannot be rescheduled; cancel it and create a manual lesson")
    if ("lesson_date" in values or "lesson_time" in values) and lesson.lesson_status != LessonStatus.SCHEDULED:
        raise LessonValidationError("Only scheduled manual lessons can be rescheduled")
    return crud_lesson.update_lesson(session, lesson, values)


def complete_lesson(session: Session, lesson_id: int) -> Lesson:
    lesson = get_lesson(session, lesson_id)
    if lesson.lesson_status != LessonStatus.SCHEDULED:
        raise LessonValidationError("Only scheduled lessons can be completed")
    if lesson.attendance_status is None:
        raise LessonValidationError("Attendance is required before completing a lesson")
    return crud_lesson.update_lesson(session, lesson, {"lesson_status": LessonStatus.COMPLETED})


def cancel_lesson(session: Session, lesson_id: int) -> Lesson:
    lesson = get_lesson(session, lesson_id)
    if lesson.lesson_status != LessonStatus.SCHEDULED:
        raise LessonValidationError("Only scheduled lessons can be canceled")
    return crud_lesson.update_lesson(session, lesson, {"lesson_status": LessonStatus.CANCELED})


def delete_lesson(session: Session, lesson_id: int) -> None:
    lesson = get_lesson(session, lesson_id)
    if lesson.schedule_id is not None:
        raise LessonValidationError("Recurring lessons cannot be deleted; cancel the lesson instead")
    crud_lesson.soft_delete_lesson(session, lesson)


def _validate_range(date_from: date, date_to: date, *, maximum_days: int | None = None) -> None:
    if date_from > date_to:
        raise LessonValidationError("date_from must be on or before date_to")
    if maximum_days is not None and (date_to - date_from).days + 1 > maximum_days:
        raise LessonValidationError(f"Date range must not exceed {maximum_days} days")
