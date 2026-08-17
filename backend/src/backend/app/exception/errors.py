from http import HTTPStatus


class AppError(Exception):
    status_code = HTTPStatus.INTERNAL_SERVER_ERROR
    detail = "Internal server error"

    def __init__(self, detail: str | None = None) -> None:
        if detail is not None:
            self.detail = detail


class NotFoundError(AppError):
    status_code = HTTPStatus.NOT_FOUND
    detail = "Resource not found"


class ValidationError(AppError):
    status_code = HTTPStatus.UNPROCESSABLE_ENTITY
    detail = "Validation error"


class StudentNotFoundError(NotFoundError):
    detail = "Student not found"


class StudentScheduleNotFoundError(NotFoundError):
    detail = "Schedule not found"


class StudentScheduleOwnershipError(NotFoundError):
    detail = "Schedule not found"


class StudentScheduleValidationError(ValidationError):
    pass
