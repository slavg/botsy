import time

from fastapi.testclient import TestClient


def test_create_message(client: TestClient, auth_headers):
    response = client.post(
        "/api/messages", json={"content": "Hello, bot!"}, headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["content"] == "Hello, bot!"
    assert not data[0]["is_bot"]
    assert data[1]["is_bot"]


def test_get_messages(client: TestClient, auth_headers):
    client.post("/api/messages", json={"content": "Test message"}, headers=auth_headers)

    response = client.get("/api/messages", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_update_message(client: TestClient, auth_headers):
    first_response = client.post(
        "/api/messages", json={"content": "First message"}, headers=auth_headers
    )
    first_message = first_response.json()[0]
    first_message_id = first_message["id"]
    print(f"First message details: {first_message}")

    # Add a small delay to ensure different timestamps
    time.sleep(1)

    second_response = client.post(
        "/api/messages", json={"content": "Second message"}, headers=auth_headers
    )
    second_message = second_response.json()[0]
    second_message_id = second_message["id"]
    print(f"Second message details: {second_message}")

    response = client.put(
        f"/api/messages/{first_message_id}",
        json={"content": "Updated first message"},
        headers=auth_headers,
    )
    print(f"First message update response: {response.status_code}, {response.json()}")
    assert response.status_code == 403
    assert "Can only modify your latest message" in response.json()["detail"]

    response = client.put(
        f"/api/messages/{second_message_id}",
        json={"content": "Updated second message"},
        headers=auth_headers,
    )
    print(f"Second message update response: {response.status_code}, {response.json()}")
    assert response.status_code == 200
    assert response.json()["content"] == "Updated second message"


def test_delete_message(client: TestClient, auth_headers):
    first_response = client.post(
        "/api/messages", json={"content": "First message"}, headers=auth_headers
    )
    first_message = first_response.json()[0]
    first_message_id = first_message["id"]

    time.sleep(1)

    second_response = client.post(
        "/api/messages", json={"content": "Second message"}, headers=auth_headers
    )
    second_message = second_response.json()[0]
    second_message_id = second_message["id"]
    print(f"Second message details: {second_message}")

    response = client.delete(f"/api/messages/{first_message_id}", headers=auth_headers)
    print(f"First message delete response: {response.status_code}, {response.json()}")
    assert response.status_code == 403
    assert "Can only modify your latest message" in response.json()["detail"]

    response = client.delete(f"/api/messages/{second_message_id}", headers=auth_headers)
    print(f"Second message delete response: {response.status_code}, {response.json()}")
    assert response.status_code == 200
    assert response.json()["ok"] is True


def test_message_content_too_long(client: TestClient, auth_headers):
    response = client.post(
        "/api/messages", json={"content": "x" * 2001}, headers=auth_headers
    )
    assert response.status_code == 422
