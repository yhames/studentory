from datetime import date

import pytest
from fastapi.testclient import TestClient

STUDENT_RESPONSE_KEYS = {
    "id",
    "name",
    "birth_year",
    "gender",
    "stage",
    "status",
    "special_notes",
    "request_notes",
}

SCHEDULE_RESPONSE_KEYS = {
    "id",
    "student_id",
    "day_of_week",
    "lesson_time",
    "effective_start_date",
}


def test_student_crud_api(client: TestClient) -> None:
    create_response = client.post(
        "/students",
        json={
            "name": "Mina",
            "birth_year": 2017,
            "gender": "FEMALE",
            "stage": "STAGE_1",
            "status": "ACTIVE",
            "special_notes": "Needs review",
            "request_notes": None,
        },
    )

    assert create_response.status_code == 201
    created = create_response.json()
    assert set(created) == STUDENT_RESPONSE_KEYS
    student_id = created["id"]
    assert created["name"] == "Mina"
    assert created["birth_year"] == 2017
    assert created["gender"] == "FEMALE"
    assert "age" not in created

    list_response = client.get("/students")
    assert list_response.status_code == 200
    assert all(set(student) == STUDENT_RESPONSE_KEYS for student in list_response.json())
    assert [student["name"] for student in list_response.json()] == ["Mina"]

    get_response = client.get(f"/students/{student_id}")
    assert get_response.status_code == 200
    assert set(get_response.json()) == STUDENT_RESPONSE_KEYS
    assert get_response.json()["stage"] == "STAGE_1"

    update_response = client.patch(
        f"/students/{student_id}",
        json={
            "birth_year": 2016,
            "gender": "MALE",
            "stage": "STAGE_2",
            "request_notes": "Use slower pace",
        },
    )
    assert update_response.status_code == 200
    assert set(update_response.json()) == STUDENT_RESPONSE_KEYS
    assert update_response.json()["birth_year"] == 2016
    assert update_response.json()["gender"] == "MALE"
    assert update_response.json()["stage"] == "STAGE_2"
    assert update_response.json()["request_notes"] == "Use slower pace"

    stage_six_response = client.patch(
        f"/students/{student_id}",
        json={"stage": "STAGE_6"},
    )
    assert stage_six_response.status_code == 200
    assert stage_six_response.json()["stage"] == "STAGE_6"


def test_student_not_found_api(client: TestClient) -> None:
    responses = [
        client.get("/students/999"),
        client.patch("/students/999", json={"name": "Missing"}),
        client.delete("/students/999"),
        client.post("/students/999/restore"),
        client.get("/students/999/schedules"),
        client.post(
            "/students/999/schedules",
            json={
                "day_of_week": "MONDAY",
                "lesson_time": "15:30",
                "effective_start_date": "2026-01-01",
            },
        ),
    ]

    for response in responses:
        assert response.status_code == 404
        assert response.json() == {"detail": "Student not found"}


@pytest.mark.parametrize(
    "invalid_fields",
    [
        {"name": "   "},
        {"birth_year": 1899},
        {"birth_year": date.today().year + 1},
        {"gender": "UNKNOWN"},
        {"stage": "STAGE_99"},
        {"status": "UNKNOWN"},
    ],
)
def test_create_student_validation_error_contract(
    client: TestClient,
    invalid_fields: dict[str, object],
) -> None:
    payload = _student_payload()
    payload.update(invalid_fields)

    response = client.post("/students", json=payload)

    assert response.status_code == 422
    body = response.json()
    assert set(body) == {"detail"}
    assert isinstance(body["detail"], list)
    invalid_field = next(iter(invalid_fields))
    assert any(error["loc"][-1] == invalid_field for error in body["detail"])


@pytest.mark.parametrize(
    "invalid_fields",
    [
        {"name": "   "},
        {"birth_year": None},
        {"birth_year": date.today().year + 1},
        {"gender": None},
        {"stage": "STAGE_99"},
        {"status": "UNKNOWN"},
    ],
)
def test_update_student_validation_error_contract(
    client: TestClient,
    invalid_fields: dict[str, object],
) -> None:
    student_id = _create_student(client)

    response = client.patch(f"/students/{student_id}", json=invalid_fields)

    assert response.status_code == 422
    body = response.json()
    assert set(body) == {"detail"}
    assert isinstance(body["detail"], list)
    invalid_field = next(iter(invalid_fields))
    assert any(error["loc"][-1] == invalid_field for error in body["detail"])


def test_delete_and_restore_student_api(client: TestClient) -> None:
    student_id = _create_student(client)

    delete_response = client.delete(f"/students/{student_id}")

    assert delete_response.status_code == 204
    assert delete_response.content == b""
    assert client.delete(f"/students/{student_id}").status_code == 204
    assert client.get(f"/students/{student_id}").status_code == 404
    assert client.get("/students").json() == []

    restore_response = client.post(f"/students/{student_id}/restore")

    assert restore_response.status_code == 200
    assert restore_response.json()["id"] == student_id
    assert client.get(f"/students/{student_id}").status_code == 200


def test_student_schedule_crud_api(client: TestClient) -> None:
    student_id = _create_student(client)

    create_response = client.post(
        f"/students/{student_id}/schedules",
        json={
            "day_of_week": "MONDAY",
            "lesson_time": "15:30",
            "effective_start_date": "2026-01-01",
        },
    )

    assert create_response.status_code == 201
    schedule = create_response.json()
    assert set(schedule) == SCHEDULE_RESPONSE_KEYS
    schedule_id = schedule["id"]
    assert schedule["student_id"] == student_id
    assert schedule["day_of_week"] == "MONDAY"

    list_response = client.get(f"/students/{student_id}/schedules")
    assert list_response.status_code == 200
    assert all(set(item) == SCHEDULE_RESPONSE_KEYS for item in list_response.json())
    assert len(list_response.json()) == 1

    update_response = client.patch(
        f"/students/{student_id}/schedules/{schedule_id}",
        json={"day_of_week": "TUESDAY", "lesson_time": "16:30"},
    )
    assert update_response.status_code == 200
    assert set(update_response.json()) == SCHEDULE_RESPONSE_KEYS
    assert update_response.json()["day_of_week"] == "TUESDAY"
    assert update_response.json()["lesson_time"] == "16:30:00"

    delete_response = client.delete(f"/students/{student_id}/schedules/{schedule_id}")
    assert delete_response.status_code == 204
    assert delete_response.content == b""
    assert client.delete(f"/students/{student_id}/schedules/{schedule_id}").status_code == 204
    assert client.get(f"/students/{student_id}/schedules").json() == []
    assert (
        client.patch(
            f"/students/{student_id}/schedules/{schedule_id}",
            json={"day_of_week": "WEDNESDAY"},
        ).status_code
        == 404
    )


def test_student_can_have_only_one_recurring_schedule_api(client: TestClient) -> None:
    student_id = _create_student(client)
    first_response = client.post(
        f"/students/{student_id}/schedules",
        json={
            "day_of_week": "MONDAY",
            "lesson_time": "15:30",
            "effective_start_date": "2026-01-01",
        },
    )

    assert first_response.status_code == 201

    second_response = client.post(
        f"/students/{student_id}/schedules",
        json={
            "day_of_week": "WEDNESDAY",
            "lesson_time": "16:30",
            "effective_start_date": "2026-01-01",
        },
    )

    assert second_response.status_code == 422


def test_schedule_missing_required_field_api(client: TestClient) -> None:
    student_id = _create_student(client)

    response = client.post(
        f"/students/{student_id}/schedules",
        json={
            "day_of_week": "MONDAY",
            "lesson_time": "15:30",
        },
    )

    assert response.status_code == 422
    assert set(response.json()) == {"detail"}
    assert isinstance(response.json()["detail"], list)
    assert any(error["loc"][-1] == "effective_start_date" for error in response.json()["detail"])


def test_schedule_ownership_mismatch_api(client: TestClient) -> None:
    first_student_id = _create_student(client, name="First")
    second_student_id = _create_student(client, name="Second")
    schedule_response = client.post(
        f"/students/{first_student_id}/schedules",
        json={
            "day_of_week": "FRIDAY",
            "lesson_time": "18:00",
            "effective_start_date": "2026-01-01",
        },
    )
    schedule_id = schedule_response.json()["id"]

    responses = [
        client.patch(
            f"/students/{second_student_id}/schedules/{schedule_id}",
            json={"day_of_week": "MONDAY"},
        ),
        client.delete(f"/students/{second_student_id}/schedules/{schedule_id}"),
    ]

    for response in responses:
        assert response.status_code == 404
        assert response.json() == {"detail": "Schedule not found"}


def test_missing_schedule_error_contract(client: TestClient) -> None:
    student_id = _create_student(client)

    responses = [
        client.patch(
            f"/students/{student_id}/schedules/999",
            json={"day_of_week": "MONDAY"},
        ),
        client.delete(f"/students/{student_id}/schedules/999"),
    ]

    for response in responses:
        assert response.status_code == 404
        assert response.json() == {"detail": "Schedule not found"}


def _create_student(client: TestClient, name: str = "Mina") -> int:
    response = client.post("/students", json=_student_payload(name))
    assert response.status_code == 201
    return int(response.json()["id"])


def _student_payload(name: str = "Mina") -> dict[str, object]:
    return {
        "name": name,
        "birth_year": 2017,
        "gender": "FEMALE",
        "stage": "STAGE_1",
        "status": "ACTIVE",
        "special_notes": None,
        "request_notes": None,
    }
