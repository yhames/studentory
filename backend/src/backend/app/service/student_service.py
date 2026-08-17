from sqlmodel import Session

from backend.app.crud import crud_student
from backend.app.exception.errors import (
    StudentNotFoundError,
    StudentScheduleNotFoundError,
    StudentScheduleOwnershipError,
    StudentScheduleValidationError,
)
from backend.app.model.student import Student, StudentSchedule
from backend.app.schema.student import (
    StudentCreate,
    StudentScheduleCreate,
    StudentScheduleUpdate,
    StudentUpdate,
)


def list_students(session: Session) -> list[Student]:
    return crud_student.get_students(session)


def get_student(session: Session, student_id: int) -> Student:
    student = crud_student.get_student(session, student_id)
    if student is None:
        raise StudentNotFoundError
    return student


def create_student(session: Session, data: StudentCreate) -> Student:
    student = Student(
        name=data.name,
        birth_year=data.birth_year,
        gender=data.gender,
        stage=data.stage,
        status=data.status,
        special_notes=data.special_notes,
        request_notes=data.request_notes,
    )
    return crud_student.create_student(session, student)


def update_student(session: Session, student_id: int, data: StudentUpdate) -> Student:
    student = get_student(session, student_id)
    values = _student_update_values(data)
    return crud_student.update_student(session, student, values)


def delete_student(session: Session, student_id: int) -> None:
    student = crud_student.get_student(session, student_id, include_deleted=True)
    if student is None:
        raise StudentNotFoundError
    if not student.use_yn:
        return
    crud_student.soft_delete_student(session, student)


def restore_student(session: Session, student_id: int) -> Student:
    student = crud_student.get_student(session, student_id, include_deleted=True)
    if student is None:
        raise StudentNotFoundError
    if student.use_yn:
        return student
    return crud_student.restore_student(session, student)


def list_student_schedules(session: Session, student_id: int) -> list[StudentSchedule]:
    get_student(session, student_id)
    return crud_student.get_student_schedules(session, student_id)


def get_student_schedule(session: Session, student_id: int, schedule_id: int) -> StudentSchedule:
    get_student(session, student_id)
    schedule = crud_student.get_student_schedule(session, schedule_id)
    if schedule is None:
        raise StudentScheduleNotFoundError
    if schedule.student_id != student_id:
        raise StudentScheduleOwnershipError
    return schedule


def create_student_schedule(
    session: Session,
    student_id: int,
    data: StudentScheduleCreate,
) -> StudentSchedule:
    get_student(session, student_id)
    if crud_student.get_student_schedules(session, student_id):
        raise StudentScheduleValidationError("Only one recurring schedule is allowed per student")
    schedule = StudentSchedule(student_id=student_id, **data.model_dump())
    return crud_student.create_student_schedule(session, schedule)


def update_student_schedule(
    session: Session,
    student_id: int,
    schedule_id: int,
    data: StudentScheduleUpdate,
) -> StudentSchedule:
    schedule = get_student_schedule(session, student_id, schedule_id)
    values = data.model_dump(exclude_unset=True)
    return crud_student.update_student_schedule(session, schedule, values)


def delete_student_schedule(session: Session, student_id: int, schedule_id: int) -> None:
    get_student(session, student_id)
    schedule = crud_student.get_student_schedule(session, schedule_id, include_deleted=True)
    if schedule is None:
        raise StudentScheduleNotFoundError
    if schedule.student_id != student_id:
        raise StudentScheduleOwnershipError
    if not schedule.use_yn:
        return
    crud_student.soft_delete_student_schedule(session, schedule)


def _student_update_values(data: StudentUpdate) -> dict[str, object]:
    values: dict[str, object] = {}
    if "name" in data.model_fields_set:
        values["name"] = data.name
    if "birth_year" in data.model_fields_set:
        values["birth_year"] = data.birth_year
    if "gender" in data.model_fields_set:
        values["gender"] = data.gender
    if "stage" in data.model_fields_set:
        values["stage"] = data.stage
    if "status" in data.model_fields_set:
        values["status"] = data.status
    if "special_notes" in data.model_fields_set:
        values["special_notes"] = data.special_notes
    if "request_notes" in data.model_fields_set:
        values["request_notes"] = data.request_notes
    return values
