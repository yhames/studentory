import uvicorn

from backend.app.app import create_app
from backend.app.core.database import settings

app = create_app()


def main():
    try:
        uvicorn.run(app, host=settings.host, port=settings.port, reload=False)
    except TypeError as e:
        if "loop_factory" in str(e):
            import asyncio

            config = uvicorn.Config(app, host=settings.host, port=settings.port, reload=True)
            server = uvicorn.Server(config)
            asyncio.run(server.serve())


if __name__ == "__main__":
    main()
