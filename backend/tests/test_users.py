def test_get_me(client, auth_headers, verified_user):
    response = client.get("/api/users/me/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == verified_user.username
    assert data["email"] == verified_user.email
    assert "profile" in data
    assert "followers_count" in data
    assert "followings_count" in data


def test_get_all_users(client, auth_headers, verified_user):
    response = client.get("/api/users/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_get_all_users_with_name_filter(client, auth_headers, verified_user):
    response = client.get("/api/users/?name=Alice", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert any(u["profile"]["name"] == "Alice" for u in data)


def test_get_user_by_username(client, auth_headers, verified_user):
    response = client.get(f"/api/users/{verified_user.username}/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == verified_user.username


def test_get_user_not_found(client, auth_headers):
    response = client.get("/api/users/doesnotexist/", headers=auth_headers)
    assert response.status_code == 404


def test_get_user_posts(client, auth_headers, verified_user):
    response = client.get(f"/api/users/{verified_user.id}/posts/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_unauthenticated_access(client):
    response = client.get("/api/users/me/")
    assert response.status_code == 401
