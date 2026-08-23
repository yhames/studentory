from __future__ import annotations

from datetime import date, time
from enum import StrEnum

from sqlalchemy import Index
from sqlmodel import Field

from backend.app.model.base import BaseModel


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


class Lesson(BaseModel, table=True):
    __table_args__ = (Index("uq_lesson_schedule_date", "schedule_id", "lesson_date", unique=True),)

    student_id: int = Field(foreign_key="student.id")
    schedule_id: int | None = Field(default=None, foreign_key="studentschedule.id")
    lesson_date: date
    lesson_time: time
    lesson_status: LessonStatus = LessonStatus.SCHEDULED
    preparation_status: PreparationStatus = PreparationStatus.NOT_PREPARED
    attendance_status: AttendanceStatus | None = None
    curriculum_progress: str | None = None
    special_notes: str | None = None
    attitude_notes: str | None = None
