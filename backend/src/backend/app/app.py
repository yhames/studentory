from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.v1.api import api_router
from backend.app.core.config import settings
from backend.app.core.database import init_db
from backend.app.core.logger import setup_logging
from backend.app.core.observability import init_sentry
from backend.app.exception.handler import register_exception_handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


def create_app() -> FastAPI:
    setup_logging()
    init_sentry(settings)
    app = FastAPI(lifespan=lifespan)
    register_exception_handlers(app)
    app.add_middleware(
        CORSMiddleware,  # type: ignore
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router)
    return app
