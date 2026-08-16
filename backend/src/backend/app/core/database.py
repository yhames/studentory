from sqlmodel import Session, create_engine

from backend.app.core.config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    echo=True,  # 터미널 콘솔에 실제 실행되는 SQL 쿼리로그를 예쁘게 찍어주는 옵션 (개발 시 매우 유용)
)

def get_session():
    with Session(engine) as session:
        yield session