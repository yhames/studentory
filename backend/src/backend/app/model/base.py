from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(UTC)


class BaseModel(SQLModel):
    id: int | None = Field(default=None, primary_key=True)
    use_yn: bool = Field(default=True, nullable=False)
    created_by: str | None = Field(default=None, max_length=100)
    created_at: datetime = Field(default_factory=utc_now, nullable=False)
    updated_by: str | None = Field(default=None, max_length=100)
    updated_at: datetime = Field(default_factory=utc_now, nullable=False)

    def touch(self, updated_by: str | None = None) -> None:
        self.updated_by = updated_by
        self.updated_at = utc_now()
