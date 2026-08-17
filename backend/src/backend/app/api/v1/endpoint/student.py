from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from backend.app.core.database import get_session
from backend.app.model.student import Student, StudentSchedule
from backend.app.schema.student import (
    StudentCreate,
    StudentResponse,
    StudentScheduleCreate,
    StudentScheduleResponse,
    StudentScheduleUpdate,
    StudentUpdate,
)
from backend.app.service import student_service

router = APIRouter(prefix="/students", tags=["students"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.get("", response_model=list[StudentResponse])
def list_students(session: SessionDep) -> list[Student]:
    return student_service.list_students(session)


@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(data: StudentCreate, session: SessionDep) -> Student:
    return student_service.create_student(session, data)


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, session: SessionDep) -> Student:
    return student_service.get_student(session, student_id)


@router.patch("/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, data: StudentUpdate, session: SessionDep) -> Student:
    return student_service.update_student(session, student_id, data)


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, session: SessionDep) -> None:
    student_service.delete_student(session, student_id)


@router.post("/{student_id}/restore", response_model=StudentResponse)
def restore_student(student_id: int, session: SessionDep) -> Student:
    return student_service.restore_student(session, student_id)


@router.get("/{student_id}/schedules", response_model=list[StudentScheduleResponse])
def list_student_schedules(student_id: int, session: SessionDep) -> list[StudentSchedule]:
    return student_service.list_student_schedules(session, student_id)


@router.post(
    "/{student_id}/schedules",
    response_model=StudentScheduleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_student_schedule(
    student_id: int,
    data: StudentScheduleCreate,
    session: SessionDep,
) -> StudentSchedule:
    return student_service.create_student_schedule(session, student_id, data)


@router.patch("/{student_id}/schedules/{schedule_id}", response_model=StudentScheduleResponse)
def update_student_schedule(
    student_id: int,
    schedule_id: int,
    data: StudentScheduleUpdate,
    session: SessionDep,
) -> StudentSchedule:
    return student_service.update_student_schedule(session, student_id, schedule_id, data)


@router.delete("/{student_id}/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student_schedule(student_id: int, schedule_id: int, session: SessionDep) -> None:
    student_service.delete_student_schedule(session, student_id, schedule_id)
