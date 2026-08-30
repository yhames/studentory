from datetime import date, time

from pydantic import BaseModel, ConfigDict, Field, field_validator

from backend.app.model.student import DayOfWeek, StudentGender, StudentStage, StudentStatus


class StudentBase(BaseModel):
    name: str = Field(min_length=1)
    birth_year: int = Field(ge=1900)
    gender: StudentGender
    stage: StudentStage
    status: StudentStatus
    special_notes: str | None = None
    request_notes: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        name = value.strip()
        if not name:
            msg = "name must not be empty"
            raise ValueError(msg)
        return name

    @field_validator("birth_year")
    @classmethod
    def validate_birth_year(cls, value: int) -> int:
        if value < 1900:
            msg = "birth_year must be 1900 or later"
            raise ValueError(msg)
        if value > date.today().year:
            msg = "birth_year must not be in the future"
            raise ValueError(msg)
        return value


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    birth_year: int | None = Field(default=None, ge=1900)
    gender: StudentGender | None = None
    stage: StudentStage | None = None
    status: StudentStatus | None = None
    special_notes: str | None = None
    request_notes: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        name = value.strip()
        if not name:
            msg = "name must not be empty"
            raise ValueError(msg)
        return name

    @field_validator("birth_year")
    @classmethod
    def validate_birth_year(cls, value: int | None) -> int | None:
        if value is None:
            msg = "birth_year is required"
            raise ValueError(msg)
        if value < 1900:
            msg = "birth_year must be 1900 or later"
            raise ValueError(msg)
        if value > date.today().year:
            msg = "birth_year must not be in the future"
            raise ValueError(msg)
        return value

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, value: StudentGender | None) -> StudentGender:
        if value is None:
            msg = "gender is required"
            raise ValueError(msg)
        return value


class StudentResponse(StudentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class StudentScheduleBase(BaseModel):
    day_of_week: DayOfWeek
    lesson_time: time
    effective_start_date: date


class StudentScheduleCreate(StudentScheduleBase):
    pass


class StudentScheduleUpdate(BaseModel):
    day_of_week: DayOfWeek | None = None
    lesson_time: time | None = None
    effective_start_date: date | None = None


class StudentScheduleResponse(StudentScheduleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
