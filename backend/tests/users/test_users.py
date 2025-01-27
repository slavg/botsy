import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


def test_create_user_success(client: TestClient):
    response = client.post(
        "/api/users", json={"username": "testuser123", "password": "testpass123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser123"
    assert "id" in data
    assert "password" not in data


def test_create_user_username_too_short(client: TestClient):
    response = client.post(
        "/api/users", json={"username": "abc", "password": "testpass123"}
    )
    assert response.status_code == 422


def test_create_user_username_too_long(client: TestClient):
    response = client.post(
        "/api/users", json={"username": "a" * 129, "password": "testpass123"}
    )
    assert response.status_code == 422


def test_create_user_password_too_short(client: TestClient):
    response = client.post(
        "/api/users", json={"username": "testuser123", "password": "short"}
    )
    assert response.status_code == 422


def test_create_user_password_too_long(client: TestClient):
    response = client.post(
        "/api/users", json={"username": "testuser123", "password": "a" * 129}
    )
    assert response.status_code == 422


def test_create_user_duplicate_username(client: TestClient):
    response1 = client.post(
        "/api/users", json={"username": "testuser123", "password": "testpass123"}
    )
    assert response1.status_code == 200

    response2 = client.post(
        "/api/users", json={"username": "testuser123", "password": "differentpass123"}
    )
    assert response2.status_code == 400


@pytest.mark.asyncio
async def test_password_is_hashed(client: TestClient, db_session: AsyncSession):
    response = client.post(
        "/api/users", json={"username": "testuser123", "password": "testpass123"}
    )
    assert response.status_code == 200
    user_id = response.json()["id"]

    result = await db_session.execute(
        text("SELECT hashed_password FROM users WHERE id = :id"), {"id": user_id}
    )
    db_password = result.scalar_one()
    assert db_password != "testpass123"
    assert len(db_password) > 20
