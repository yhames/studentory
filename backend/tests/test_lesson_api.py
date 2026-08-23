from fastapi.testclient import TestClient


def test_generate_is_idempotent_and_obeys_schedule_rules(client: TestClient) -> None:
    active_id = _create_student(client, "Active", status="ACTIVE")
    inactive_id = _create_student(client, "Ended", status="ENDED")
    _create_schedule(client, active_id, "WEDNESDAY", "2026-08-01", "15:30")
    _create_schedule(client, inactive_id, "WEDNESDAY", "2026-08-01", "16:30")

    first = client.post("/lessons/generate", json={"date_from": "2026-08-17", "date_to": "2026-08-23"})
    second = client.post("/lessons/generate", json={"date_from": "2026-08-17", "date_to": "2026-08-23"})

    assert first.status_code == 200
    assert first.json() == {"created_count": 1}
    assert second.json() == {"created_count": 0}
    lessons = client.get("/lessons?date_from=2026-08-17&date_to=2026-08-23").json()
    assert len(lessons) == 1
    assert lessons[0]["student_id"] == active_id
    assert lessons[0]["lesson_date"] == "2026-08-19"


def test_generate_excludes_future_and_deleted_schedules_and_students(client: TestClient) -> None:
    future_id = _create_student(client, "Future")
    deleted_schedule_id = _create_student(client, "Deleted schedule")
    deleted_student_id = _create_student(client, "Deleted student")
    _create_schedule(client, future_id, "MONDAY", "2026-08-25", "14:00")
    schedule_id = _create_schedule(client, deleted_schedule_id, "MONDAY", "2026-08-01", "15:00")
    _create_schedule(client, deleted_student_id, "MONDAY", "2026-08-01", "16:00")
    client.delete(f"/students/{deleted_schedule_id}/schedules/{schedule_id}")
    client.delete(f"/students/{deleted_student_id}")

    response = client.post("/lessons/generate", json={"date_from": "2026-08-17", "date_to": "2026-08-23"})

    assert response.json() == {"created_count": 0}
    too_long = client.post("/lessons/generate", json={"date_from": "2026-08-01", "date_to": "2026-08-08"})
    assert too_long.status_code == 422


def test_manual_lesson_crud_notes_filters_and_sorting(client: TestClient) -> None:
    first_student = _create_student(client, "First")
    second_student = _create_student(client, "Second")
    later = _create_manual_lesson(client, first_student, "2026-08-18", "17:00")
    earlier = _create_manual_lesson(client, second_student, "2026-08-17", "13:00")

    update = client.patch(
        f"/lessons/{earlier}",
        json={
            "lesson_time": "12:30",
            "preparation_status": "PREPARED",
            "attendance_status": "PRESENT",
            "curriculum_progress": "1-24",
            "special_notes": "Needs review",
            "attitude_notes": "Focused",
        },
    )

    assert update.status_code == 200
    assert update.json()["attitude_notes"] == "Focused"
    assert update.json()["special_notes"] == "Needs review"
    listed = client.get("/lessons?date_from=2026-08-17&date_to=2026-08-18").json()
    assert [lesson["id"] for lesson in listed] == [earlier, later]
    filtered = client.get(
        f"/lessons?date_from=2026-08-17&date_to=2026-08-18&student_id={second_student}"
        "&preparation_status=PREPARED&attendance_status=PRESENT&lesson_status=SCHEDULED"
    ).json()
    assert [lesson["id"] for lesson in filtered] == [earlier]
    assert client.get(f"/lessons/{earlier}").json()["curriculum_progress"] == "1-24"

    assert client.delete(f"/lessons/{later}").status_code == 204
    assert client.get(f"/lessons/{later}").status_code == 404


def test_complete_requires_attendance_and_cancel_preserves_record(client: TestClient) -> None:
    student_id = _create_student(client, "Student")
    completion_id = _create_manual_lesson(client, student_id, "2026-08-17", "13:00")
    canceled_id = _create_manual_lesson(client, student_id, "2026-08-18", "13:00")

    invalid = client.post(f"/lessons/{completion_id}/complete")
    assert invalid.status_code == 422
    client.patch(f"/lessons/{completion_id}", json={"attendance_status": "ABSENT"})
    completed = client.post(f"/lessons/{completion_id}/complete")
    assert completed.json()["lesson_status"] == "COMPLETED"

    canceled = client.post(f"/lessons/{canceled_id}/cancel")
    assert canceled.json()["lesson_status"] == "CANCELED"
    assert client.get(f"/lessons/{canceled_id}").status_code == 200


def test_recurring_lesson_cannot_be_moved_or_deleted(client: TestClient) -> None:
    student_id = _create_student(client, "Student")
    _create_schedule(client, student_id, "MONDAY", "2026-08-01", "15:00")
    client.post("/lessons/generate", json={"date_from": "2026-08-17", "date_to": "2026-08-23"})
    lesson = client.get("/lessons?date_from=2026-08-17&date_to=2026-08-23").json()[0]

    move = client.patch(f"/lessons/{lesson['id']}", json={"lesson_date": "2026-08-18"})
    delete = client.delete(f"/lessons/{lesson['id']}")

    assert move.status_code == 422
    assert delete.status_code == 422
    assert "cancel" in delete.json()["detail"].lower()


def test_missing_or_deleted_resources_and_invalid_ranges(client: TestClient) -> None:
    student_id = _create_student(client, "Deleted")
    lesson_id = _create_manual_lesson(client, student_id, "2026-08-17", "13:00")
    client.delete(f"/students/{student_id}")

    assert (
        client.post(
            "/lessons",
            json={"student_id": student_id, "lesson_date": "2026-08-17", "lesson_time": "13:00"},
        ).status_code
        == 404
    )
    assert client.get("/lessons/999").status_code == 404
    assert client.get(f"/lessons/{lesson_id}").status_code == 404
    assert client.get("/lessons?date_from=2026-08-17&date_to=2026-08-17").json() == []
    assert client.get("/lessons?date_from=2026-08-18&date_to=2026-08-17").status_code == 422


def _create_student(client: TestClient, name: str, status: str = "ACTIVE") -> int:
    response = client.post(
        "/students",
        json={
            "name": name,
            "birth_year": 2017,
            "gender": "FEMALE",
            "stage": "STAGE_1",
            "status": status,
        },
    )
    assert response.status_code == 201
    return int(response.json()["id"])


def _create_schedule(client: TestClient, student_id: int, day: str, start: str, lesson_time: str) -> int:
    response = client.post(
        f"/students/{student_id}/schedules",
        json={"day_of_week": day, "lesson_time": lesson_time, "effective_start_date": start},
    )
    assert response.status_code == 201
    return int(response.json()["id"])


def _create_manual_lesson(client: TestClient, student_id: int, lesson_date: str, lesson_time: str) -> int:
    response = client.post(
        "/lessons",
        json={"student_id": student_id, "lesson_date": lesson_date, "lesson_time": lesson_time},
    )
    assert response.status_code == 201
    return int(response.json()["id"])
