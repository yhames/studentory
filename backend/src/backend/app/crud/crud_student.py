from sqlmodel import Session, col, select

from backend.app.model.student import Student, StudentSchedule


def get_students(session: Session) -> list[Student]:
    statement = select(Student).where(col(Student.use_yn).is_(True)).order_by(col(Student.id))
    return list(session.exec(statement).all())


def get_student(session: Session, student_id: int, *, include_deleted: bool = False) -> Student | None:
    statement = select(Student).where(Student.id == student_id)
    if not include_deleted:
        statement = statement.where(col(Student.use_yn).is_(True))
    return session.exec(statement).one_or_none()


def create_student(session: Session, student: Student) -> Student:
    session.add(student)
    session.commit()
    session.refresh(student)
    return student


def update_student(session: Session, student: Student, values: dict[str, object]) -> Student:
    for field, value in values.items():
        setattr(student, field, value)
    student.touch()
    session.add(student)
    session.commit()
    session.refresh(student)
    return student


def soft_delete_student(session: Session, student: Student) -> None:
    student.use_yn = False
    student.touch()
    session.add(student)
    session.commit()


def restore_student(session: Session, student: Student) -> Student:
    student.use_yn = True
    student.touch()
    session.add(student)
    session.commit()
    session.refresh(student)
    return student


def get_student_schedules(session: Session, student_id: int) -> list[StudentSchedule]:
    statement = (
        select(StudentSchedule)
        .where(StudentSchedule.student_id == student_id, col(StudentSchedule.use_yn).is_(True))
        .order_by(col(StudentSchedule.effective_start_date), col(StudentSchedule.id))
    )
    return list(session.exec(statement).all())


def get_student_schedule(
    session: Session,
    schedule_id: int,
    *,
    include_deleted: bool = False,
) -> StudentSchedule | None:
    statement = select(StudentSchedule).where(StudentSchedule.id == schedule_id)
    if not include_deleted:
        statement = statement.where(col(StudentSchedule.use_yn).is_(True))
    return session.exec(statement).one_or_none()


def create_student_schedule(session: Session, schedule: StudentSchedule) -> StudentSchedule:
    session.add(schedule)
    session.commit()
    session.refresh(schedule)
    return schedule


def update_student_schedule(
    session: Session,
    schedule: StudentSchedule,
    values: dict[str, object],
) -> StudentSchedule:
    for field, value in values.items():
        setattr(schedule, field, value)
    schedule.touch()
    session.add(schedule)
    session.commit()
    session.refresh(schedule)
    return schedule


def soft_delete_student_schedule(session: Session, schedule: StudentSchedule) -> None:
    schedule.use_yn = False
    schedule.touch()
    session.add(schedule)
    session.commit()
