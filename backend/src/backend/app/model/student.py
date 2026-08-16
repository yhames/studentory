from __future__ import annotations

from datetime import date, time
from enum import StrEnum

from sqlmodel import Field, Relationship, SQLModel


class StudentStage(StrEnum):
    STAGE_1 = "STAGE_1"
    STAGE_2 = "STAGE_2"
    STAGE_3 = "STAGE_3"


class StudentStatus(StrEnum):
    FIRST_CONSULTATION_REQUIRED = "FIRST_CONSULTATION_REQUIRED"
    ACTIVE = "ACTIVE"
    ENDED = "ENDED"


class DayOfWeek(StrEnum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"
    SATURDAY = "SATURDAY"
    SUNDAY = "SUNDAY"


class LessonStatus(StrEnum):
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    CANCELED = "CANCELED"


class PreparationStatus(StrEnum):
    NOT_PREPARED = "NOT_PREPARED"
    PREPARED = "PREPARED"


class AttendanceStatus(StrEnum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"


class Student(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(min_length=1)
    birth_year: int | None = Field(default=None, ge=1900)
    stage: StudentStage
    status: StudentStatus
    special_notes: str | None = None
    requests: str | None = None

    schedules: list[StudentSchedule] = Relationship(back_populates="student")
    lessons: list[Lesson] = Relationship(back_populates="student")


class StudentSchedule(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    day_of_week: DayOfWeek
    lesson_time: time
    effective_start_date: date
    effective_end_date: date | None = None
    is_active: bool = True

    student: Student = Relationship(back_populates="schedules")
    lessons: list[Lesson] = Relationship(back_populates="schedule")


class Lesson(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    schedule_id: int | None = Field(default=None, foreign_key="studentschedule.id")
    lesson_date: date
    lesson_time: time
    lesson_status: LessonStatus = LessonStatus.SCHEDULED
    preparation_status: PreparationStatus = PreparationStatus.NOT_PREPARED
    attendance_status: AttendanceStatus | None = None
    curriculum_progress: str | None = None
    special_notes: str | None = None

    student: Student = Relationship(back_populates="lessons")
    schedule: StudentSchedule | None = Relationship(back_populates="lessons")
