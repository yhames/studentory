from pathlib import Path

from sqlalchemy import inspect, text
from sqlmodel import Session, SQLModel, create_engine

from backend.app.core.config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, connect_args=connect_args)
INIT_SQL_PATH = Path(__file__).resolve().parents[4] / "init.sql"


def init_db() -> None:
    if settings.database_url.startswith("sqlite:///"):
        db_path = settings.database_url.removeprefix("sqlite:///")
        if db_path and db_path != ":memory:":
            Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    from backend.app.model.lesson import Lesson  # noqa: F401
    from backend.app.model.student import Student, StudentSchedule  # noqa: F401

    SQLModel.metadata.create_all(engine)
    if settings.database_url.startswith("sqlite"):
        _ensure_sqlite_common_columns()
    seed_test_data()  # Comment out this line when demo data is no longer needed.


def get_session():
    with Session(engine) as session:
        yield session


def seed_test_data(sql_path: Path = INIT_SQL_PATH) -> None:
    """Load idempotent local demo data from init.sql."""
    sql = sql_path.read_text(encoding="utf-8")
    statements = (statement.strip() for statement in sql.split(";"))
    with engine.begin() as connection:
        for statement in statements:
            if statement:
                connection.execute(text(statement))


def _ensure_sqlite_common_columns() -> None:
    inspector = inspect(engine)
    common_columns = {
        "use_yn": "BOOLEAN NOT NULL DEFAULT 1",
        "created_by": "VARCHAR(100)",
        "created_at": "DATETIME",
        "updated_by": "VARCHAR(100)",
        "updated_at": "DATETIME",
    }
    table_names = {"student", "studentschedule", "lesson"}
    table_columns = {
        "student": {
            "gender": "VARCHAR(20)",
        },
        "lesson": {
            "attitude_notes": "VARCHAR",
        },
    }

    with engine.begin() as connection:
        for table_name in table_names.intersection(inspector.get_table_names()):
            existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
            for column_name, column_type in common_columns.items():
                if column_name not in existing_columns:
                    connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"))
            for column_name, column_type in table_columns.get(table_name, {}).items():
                if column_name not in existing_columns:
                    connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"))
            connection.execute(
                text(
                    f"""
                    UPDATE {table_name}
                    SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
                        updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
                    """
                )
            )
        if "lesson" in inspector.get_table_names():
            connection.execute(
                text("CREATE UNIQUE INDEX IF NOT EXISTS uq_lesson_schedule_date ON lesson (schedule_id, lesson_date)")
            )
