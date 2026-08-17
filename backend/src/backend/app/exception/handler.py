from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.responses import JSONResponse

from backend.app.exception.errors import AppError


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, app_error_handler)


def app_error_handler(request: Request, exc: Exception) -> JSONResponse:
    if not isinstance(exc, AppError):
        raise exc

    return JSONResponse(
        status_code=int(exc.status_code),
        content={"detail": exc.detail},
    )
