import logging
import sys

from loguru import logger


class InterceptHandler(logging.Handler):
    """표준 logging 모듈의 로그를 Loguru로 전달하는 인터셉트 핸들러"""

    def emit(self, record):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def setup_logging():
    logging.root.handlers = []

    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
    )

    logger.configure(
        handlers=[{"sink": sys.stdout, "format": log_format, "level": "INFO"}]  # type: ignore[list-item]
    )

    logger.add(
        "logs/studentory_{time:YYYY-MM-DD}.log",
        rotation="10 MB",  # 10MB 차면 새 파일 생성
        retention="30 days",  # 30일 지나면 옛날 로그 자동 삭제
        compression="zip",  # 지난 로그는 zip으로 압축
        level="INFO",
    )

    for logger_name in ("uvicorn", "uvicorn.asgi", "uvicorn.access", "fastapi"):
        mod_logger = logging.getLogger(logger_name)
        mod_logger.handlers = [InterceptHandler()]
        mod_logger.propagate = False
