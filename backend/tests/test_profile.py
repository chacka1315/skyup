def test_update_profile(client, auth_headers):
    response = client.put(
        "/api/profiles/",
        data={"name": "Alice Updated", "bio": "Hello I'm Alice", "country": "CI"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Alice Updated"
    assert data["bio"] == "Hello I'm Alice"
    assert data["country"] == "CI"


def test_update_profile_name_only(client, auth_headers):
    response = client.put(
        "/api/profiles/",
        data={"name": "Alice"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Alice"


def test_update_profile_unauthenticated(client):
    response = client.put("/api/profiles/", data={"name": "Hacker"})
    assert response.status_code == 401
