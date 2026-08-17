from __future__ import annotations

from datetime import date, time
from enum import StrEnum

from sqlmodel import Field

from backend.app.model.base import BaseModel


class StudentStage(StrEnum):
    STAGE_1 = "STAGE_1"
    STAGE_2 = "STAGE_2"
    STAGE_3 = "STAGE_3"
    STAGE_4 = "STAGE_4"
    STAGE_5 = "STAGE_5"
    STAGE_6 = "STAGE_6"


class StudentStatus(StrEnum):
    FIRST_CONSULTATION_REQUIRED = "FIRST_CONSULTATION_REQUIRED"
    ACTIVE = "ACTIVE"
    ENDED = "ENDED"


class StudentGender(StrEnum):
    MALE = "MALE"
    FEMALE = "FEMALE"


class DayOfWeek(StrEnum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"
    SATURDAY = "SATURDAY"
    SUNDAY = "SUNDAY"


class Student(BaseModel, table=True):
    name: str = Field(min_length=1)
    birth_year: int | None = Field(default=None, ge=1900)
    gender: StudentGender | None = None
    stage: StudentStage
    status: StudentStatus
    special_notes: str | None = None
    request_notes: str | None = None

    @property
    def age(self) -> int | None:
        if self.birth_year is None:
            return None
        return date.today().year - self.birth_year


class StudentSchedule(BaseModel, table=True):
    student_id: int = Field(foreign_key="student.id")
    day_of_week: DayOfWeek
    lesson_time: time
    effective_start_date: date
