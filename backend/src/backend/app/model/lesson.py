from __future__ import annotations

from datetime import date, time
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from backend.app.model.student import Student, StudentSchedule


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
