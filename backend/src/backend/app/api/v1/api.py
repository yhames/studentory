from fastapi import APIRouter

from backend.app.api.v1.endpoint.student import router as student_router

api_router = APIRouter()
api_router.include_router(student_router)
