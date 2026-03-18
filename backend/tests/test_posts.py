from uuid import uuid4
import pytest


@pytest.fixture()
def sample_post(client, auth_headers):
    response = client.post(
        "/api/posts/",
        data={"content": "Hello World"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    return response.json()


def test_create_post(client, auth_headers):
    response = client.post(
        "/api/posts/",
        data={"content": "My first post"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "My first post"
    assert "author" in data
    assert data["likes_count"] == 0
    assert data["replies_count"] == 0


def test_create_post_empty_content(client, auth_headers):
    response = client.post(
        "/api/posts/",
        data={"content": "   "},
        headers=auth_headers,
    )
    assert response.status_code == 400


def test_create_post_unauthenticated(client):
    response = client.post("/api/posts/", data={"content": "test"})
    assert response.status_code == 401


def test_update_post(client, auth_headers, sample_post):
    response = client.put(
        f"/api/posts/{sample_post['id']}/",
        json={"content": "Updated content"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_update_post_not_found(client, auth_headers):
    response = client.put(
        f"/api/posts/{uuid4()}/",
        json={"content": "Updated"},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_delete_post(client, auth_headers, sample_post):
    response = client.delete(
        f"/api/posts/{sample_post['id']}/",
        headers=auth_headers,
    )
    assert response.status_code == 200


def test_delete_post_not_found(client, auth_headers):
    response = client.delete(
        f"/api/posts/{uuid4()}/",
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_get_feed_posts(client, auth_headers, sample_post):
    response = client.get("/api/posts/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_trending_posts(client, auth_headers):
    response = client.get("/api/posts/trends/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_single_post(client, auth_headers, sample_post):
    response = client.get(f"/api/posts/{sample_post['id']}/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_post["id"]
    assert "author" in data


def test_get_single_post_not_found(client, auth_headers):
    response = client.get(f"/api/posts/{uuid4()}/", headers=auth_headers)
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Likes
# ---------------------------------------------------------------------------

def test_like_post(client, auth_headers, sample_post):
    response = client.post(
        f"/api/posts/{sample_post['id']}/like/",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_like_post_twice(client, auth_headers, sample_post):
    client.post(f"/api/posts/{sample_post['id']}/like/", headers=auth_headers)
    response = client.post(f"/api/posts/{sample_post['id']}/like/", headers=auth_headers)
    assert response.status_code == 400


def test_unlike_post(client, auth_headers, sample_post):
    client.post(f"/api/posts/{sample_post['id']}/like/", headers=auth_headers)
    response = client.delete(f"/api/posts/{sample_post['id']}/like/", headers=auth_headers)
    assert response.status_code == 200


def test_unlike_post_not_liked(client, auth_headers, sample_post):
    response = client.delete(f"/api/posts/{sample_post['id']}/like/", headers=auth_headers)
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Bookmarks
# ---------------------------------------------------------------------------

def test_bookmark_post(client, auth_headers, sample_post):
    response = client.post(
        f"/api/posts/{sample_post['id']}/bookmark/",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_bookmark_post_twice(client, auth_headers, sample_post):
    client.post(f"/api/posts/{sample_post['id']}/bookmark/", headers=auth_headers)
    response = client.post(f"/api/posts/{sample_post['id']}/bookmark/", headers=auth_headers)
    assert response.status_code == 400


def test_unbookmark_post(client, auth_headers, sample_post):
    client.post(f"/api/posts/{sample_post['id']}/bookmark/", headers=auth_headers)
    response = client.delete(f"/api/posts/{sample_post['id']}/bookmark/", headers=auth_headers)
    assert response.status_code == 200


def test_unbookmark_post_not_bookmarked(client, auth_headers, sample_post):
    response = client.delete(f"/api/posts/{sample_post['id']}/bookmark/", headers=auth_headers)
    assert response.status_code == 404


def test_get_bookmarks(client, auth_headers, sample_post):
    client.post(f"/api/posts/{sample_post['id']}/bookmark/", headers=auth_headers)
    response = client.get("/api/posts/bookmarks/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(p["id"] == sample_post["id"] for p in data)
