from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from backend.app.core.database import get_session
from backend.app.model.lesson import AttendanceStatus, Lesson, LessonStatus, PreparationStatus
from backend.app.schema.lesson import (
    LessonCreate,
    LessonGenerateRequest,
    LessonGenerateResponse,
    LessonResponse,
    LessonUpdate,
)
from backend.app.service import lesson_service

router = APIRouter(prefix="/lessons", tags=["lessons"])
SessionDep = Annotated[Session, Depends(get_session)]


@router.get("", response_model=list[LessonResponse])
def list_lessons(
    session: SessionDep,
    date_from: Annotated[date, Query()],
    date_to: Annotated[date, Query()],
    student_id: int | None = None,
    lesson_status: LessonStatus | None = None,
    preparation_status: PreparationStatus | None = None,
    attendance_status: AttendanceStatus | None = None,
) -> list[Lesson]:
    return lesson_service.list_lessons(
        session,
        date_from,
        date_to,
        student_id=student_id,
        lesson_status=lesson_status,
        preparation_status=preparation_status,
        attendance_status=attendance_status,
    )


@router.post("/generate", response_model=LessonGenerateResponse)
def generate_lessons(data: LessonGenerateRequest, session: SessionDep) -> LessonGenerateResponse:
    return LessonGenerateResponse(created_count=lesson_service.generate_lessons(session, data))


@router.post("", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
def create_lesson(data: LessonCreate, session: SessionDep) -> Lesson:
    return lesson_service.create_lesson(session, data)


@router.get("/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, session: SessionDep) -> Lesson:
    return lesson_service.get_lesson(session, lesson_id)


@router.patch("/{lesson_id}", response_model=LessonResponse)
def update_lesson(lesson_id: int, data: LessonUpdate, session: SessionDep) -> Lesson:
    return lesson_service.update_lesson(session, lesson_id, data)


@router.post("/{lesson_id}/complete", response_model=LessonResponse)
def complete_lesson(lesson_id: int, session: SessionDep) -> Lesson:
    return lesson_service.complete_lesson(session, lesson_id)


@router.post("/{lesson_id}/cancel", response_model=LessonResponse)
def cancel_lesson(lesson_id: int, session: SessionDep) -> Lesson:
    return lesson_service.cancel_lesson(session, lesson_id)


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lesson(lesson_id: int, session: SessionDep) -> None:
    lesson_service.delete_lesson(session, lesson_id)
