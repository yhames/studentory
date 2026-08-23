from datetime import date, time

from pydantic import BaseModel, ConfigDict, model_validator

from backend.app.model.lesson import AttendanceStatus, LessonStatus, PreparationStatus


class LessonGenerateRequest(BaseModel):
    date_from: date
    date_to: date


class LessonGenerateResponse(BaseModel):
    created_count: int


class LessonCreate(BaseModel):
    student_id: int
    lesson_date: date
    lesson_time: time


class LessonUpdate(BaseModel):
    lesson_date: date | None = None
    lesson_time: time | None = None
    preparation_status: PreparationStatus | None = None
    attendance_status: AttendanceStatus | None = None
    curriculum_progress: str | None = None
    special_notes: str | None = None
    attitude_notes: str | None = None

    @model_validator(mode="after")
    def reject_null_required_values(self) -> "LessonUpdate":
        for field in ("lesson_date", "lesson_time", "preparation_status"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} must not be null")
        return self


class LessonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    schedule_id: int | None
    lesson_date: date
    lesson_time: time
    lesson_status: LessonStatus
    preparation_status: PreparationStatus
    attendance_status: AttendanceStatus | None
    curriculum_progress: str | None
    special_notes: str | None
    attitude_notes: str | None
