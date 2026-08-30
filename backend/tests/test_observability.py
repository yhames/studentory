from typing import Any

from backend.app.core.config import Settings
from backend.app.core.observability import init_sentry


def test_sentry_is_disabled_without_dsn(monkeypatch) -> None:
    calls: list[dict[str, Any]] = []
    monkeypatch.setattr("backend.app.core.observability.sentry_sdk.init", lambda **kwargs: calls.append(kwargs))

    init_sentry(Settings(_env_file=None, sentry_dsn=None))  # type: ignore[call-arg]

    assert calls == []


def test_sentry_uses_safe_defaults(monkeypatch) -> None:
    calls: list[dict[str, Any]] = []
    monkeypatch.setattr("backend.app.core.observability.sentry_sdk.init", lambda **kwargs: calls.append(kwargs))

    init_sentry(
        Settings(  # type: ignore[call-arg]
            _env_file=None,
            sentry_dsn="https://public@example.invalid/1",
            sentry_environment="test",
            sentry_traces_sample_rate=0.25,
        )
    )

    assert calls == [
        {
            "dsn": "https://public@example.invalid/1",
            "environment": "test",
            "traces_sample_rate": 0.25,
            "send_default_pii": False,
        }
    ]
