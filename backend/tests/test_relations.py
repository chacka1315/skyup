from uuid import uuid4


def test_follow_user(client, auth_headers, second_user):
    response = client.post(
        "/api/relations/",
        json={"following_id": str(second_user.id)},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert str(data["following_id"]) == str(second_user.id)


def test_follow_user_twice(client, auth_headers, second_user):
    client.post(
        "/api/relations/",
        json={"following_id": str(second_user.id)},
        headers=auth_headers,
    )
    response = client.post(
        "/api/relations/",
        json={"following_id": str(second_user.id)},
        headers=auth_headers,
    )
    assert response.status_code == 400


def test_follow_self(client, auth_headers, verified_user):
    response = client.post(
        "/api/relations/",
        json={"following_id": str(verified_user.id)},
        headers=auth_headers,
    )
    assert response.status_code == 400


def test_follow_nonexistent_user(client, auth_headers):
    response = client.post(
        "/api/relations/",
        json={"following_id": str(uuid4())},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_unfollow_user(client, auth_headers, second_user):
    client.post(
        "/api/relations/",
        json={"following_id": str(second_user.id)},
        headers=auth_headers,
    )
    response = client.request(
        "DELETE",
        "/api/relations/",
        json={"following_id": str(second_user.id)},
        headers=auth_headers,
    )
    assert response.status_code == 200


def test_unfollow_not_following(client, auth_headers, second_user):
    response = client.request(
        "DELETE",
        "/api/relations/",
        json={"following_id": str(second_user.id)},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_get_followers(client, auth_headers, verified_user, second_user, db_session):
    from app.models import Relation

    # second_user follows verified_user directly in DB
    relation = Relation(follower_id=second_user.id, following_id=verified_user.id)
    db_session.add(relation)
    db_session.flush()

    response = client.get("/api/relations/followers", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert any(str(u["id"]) == str(second_user.id) for u in data)


def test_get_followings(client, auth_headers, second_user):
    client.post(
        "/api/relations/",
        json={"following_id": str(second_user.id)},
        headers=auth_headers,
    )
    response = client.get("/api/relations/followings", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert any(str(u["id"]) == str(second_user.id) for u in data)
