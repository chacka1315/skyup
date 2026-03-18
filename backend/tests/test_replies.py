from uuid import uuid4
import pytest


@pytest.fixture()
def sample_post(client, auth_headers):
    response = client.post(
        "/api/posts/",
        data={"content": "Post for replies"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    return response.json()


@pytest.fixture()
def sample_reply(client, auth_headers, sample_post):
    response = client.post(
        f"/api/posts/{sample_post['id']}/replies/",
        json={"content": "Test reply"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    return response.json()


def test_create_reply(client, auth_headers, sample_post):
    response = client.post(
        f"/api/posts/{sample_post['id']}/replies/",
        json={"content": "My reply"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "My reply"


def test_reply_to_nonexistent_post(client, auth_headers):
    response = client.post(
        f"/api/posts/{uuid4()}/replies/",
        json={"content": "Reply"},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_update_reply(client, auth_headers, sample_post, sample_reply):
    response = client.put(
        f"/api/posts/{sample_post['id']}/replies/{sample_reply['id']}/",
        json={"content": "Updated reply"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["content"] == "Updated reply"


def test_update_reply_not_found(client, auth_headers, sample_post):
    response = client.put(
        f"/api/posts/{sample_post['id']}/replies/{uuid4()}/",
        json={"content": "Updated"},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_delete_reply(client, auth_headers, sample_post, sample_reply):
    response = client.delete(
        f"/api/posts/{sample_post['id']}/replies/{sample_reply['id']}/",
        headers=auth_headers,
    )
    assert response.status_code == 200


def test_delete_reply_not_found(client, auth_headers, sample_post):
    response = client.delete(
        f"/api/posts/{sample_post['id']}/replies/{uuid4()}/",
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_get_post_replies(client, auth_headers, sample_post, sample_reply):
    response = client.get(
        f"/api/posts/{sample_post['id']}/replies/",
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(r["id"] == sample_reply["id"] for r in data)


def test_get_single_reply(client, auth_headers, sample_post, sample_reply):
    response = client.get(
        f"/api/posts/{sample_post['id']}/replies/{sample_reply['id']}/",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["id"] == sample_reply["id"]


def test_get_single_reply_not_found(client, auth_headers, sample_post):
    response = client.get(
        f"/api/posts/{sample_post['id']}/replies/{uuid4()}/",
        headers=auth_headers,
    )
    assert response.status_code == 404
