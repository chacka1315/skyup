from faker import Faker
import random
from app.core.db import engine
from sqlmodel import Session
from app.models import User, Post, Reply, Relation, Profile, Like, Bookmark
from app.helpers.db import generate_uuid7

fake = Faker()

# print(fake.unique.email())
# 800 users;
# 40k posts;
# 250k likes;
# 15k follows;
users_count = 800
posts_count = 40_000
replies_count = 20_000
likes_count = 400_000
bookmarks_count = 100_000
follows_count = 20_000


def seed_users(session: Session):
    users: list[User] = []

    print("\n⌛ Generating users and profiles...")

    for _ in range(users_count):

        user = User(
            username=fake.unique.user_name(),
            email=fake.unique.email(),
            password=fake.password(),
            id=generate_uuid7(),
            is_verified=True,
        )

        profile = Profile(
            name=fake.name(),
            country=fake.country(),
            birthday=fake.date_this_century(),
            id=generate_uuid7(),
            user_id=user.id,
            bio=fake.catch_phrase(),
            avatar_url="https://picsum.photos/800/800",
            banner_url="https://picsum.photos/1000/500",
        )

        try:
            session.add(user)
            session.flush()
            session.refresh(user)
            users.append(user)

            session.add(profile)
            session.flush()
        except Exception as err:
            print("⚠️ Seed error:", err)
            continue

    print(f"\n✅ Finish seeding users and profile. Total -> {len(users)}")
    return users


def seed_posts(session: Session, users: list[User]):
    posts: list[Post] = []
    print("\n⌛ Generating posts...")

    if not users:
        print("⚠️ No users available. Skip posts seeding.")
        return posts

    images_sizes = [(800, 600), (600, 800), (1000, 1000), (2000, 2000), (3000, 2000)]

    for _ in range(posts_count):
        have_image = random.choice([True, False])

        author = random.choice(users)
        post = Post(
            id=generate_uuid7(),
            author_id=author.id,
            content=fake.paragraph(nb_sentences=6)[:500],
        )

        if have_image:
            post.media_type = "image"
            width, height = random.choice(images_sizes)
            post.media_url = f"https://picsum.photos/{width}/{height}"
        try:
            session.add(post)
            session.flush()
            session.refresh(post)
            posts.append(post)
        except Exception as err:
            print("⚠️ Seed error:", err)
            continue

    print(f"\n✅ Finish seeding posts. Total -> {len(posts)}")
    return posts


def seed_replies(session: Session, users: list[User], posts: list[Post]):
    replies: list[Reply] = []
    print("\n⌛ Generating replies...")

    if not users or not posts:
        print("⚠️ Missing users or posts. Skip replies seeding.")
        return replies

    for _ in range(replies_count):
        author = random.choice(users)
        post = random.choice(posts)
        reply = Reply(
            id=generate_uuid7(),
            author_id=author.id,
            post_id=post.id,
            content=fake.paragraph(random.randint(1, 5))[:300],
        )

        try:
            session.add(reply)
            session.flush()
            replies.append(reply)
        except Exception as err:
            print("⚠️ Seed error:", err)
            continue

    print(f"\n✅ Finish seeding replies. Total  -> {len(replies)}")
    return replies


def seed_likes(session: Session, users: list[User], posts: list[Post]):
    print("\n⌛ Generating likes...")

    if not users or not posts:
        print("⚠️ Missing users or posts. Skip likes seeding.")
        return

    existing_pairs: set[tuple] = set()

    iterations_count = 0

    while len(existing_pairs) < likes_count and iterations_count < likes_count * 1.5:
        iterations_count += 1

        user = random.choice(users)
        post = random.choice(posts)
        pair = (user.id, post.id)
        if pair in existing_pairs:
            continue

        like = Like(id=generate_uuid7(), author_id=user.id, post_id=post.id)

        try:
            session.add(like)
            session.flush()
            existing_pairs.add(pair)
        except Exception as err:
            print("⚠️ Seed error:", err)
            continue

    print(f"\n✅ Finish seeding likes. Total -> {len(existing_pairs)}")


def seed_bookmarks(session: Session, users: list[User], posts: list[Post]):
    print("\n⌛ Generating bookmarks...")

    if not users or not posts:
        print("⚠️ Missing users or posts. Skip bookmarks seeding.")
        return

    existing_pairs: set[tuple] = set()
    iterations_count = 0

    while (
        len(existing_pairs) < bookmarks_count
        and iterations_count < bookmarks_count * 1.5
    ):
        iterations_count += 1

        user = random.choice(users)
        post = random.choice(posts)
        pair = (user.id, post.id)
        if pair in existing_pairs:
            continue

        bookmark = Bookmark(id=generate_uuid7(), owner_id=user.id, post_id=post.id)
        try:
            session.add(bookmark)
            session.flush()
            existing_pairs.add(pair)
        except Exception as err:
            print("⚠️ Seed error:", err)
            continue

    print(f"\n✅ Finish seeding bookmarks. Total -> {len(existing_pairs)}")


def seed_relations(session: Session, users: list[User]):
    print("\n⌛ Generating relations...")

    if not users:
        print("⚠️ Missing users. Skip relations seeding.")
        return

    existing_pairs: set[tuple] = set()

    iterations_count = 0
    while (
        len(existing_pairs) < follows_count and iterations_count < follows_count * 1.5
    ):
        iterations_count += 1

        user1, user2 = random.sample(users, k=2)

        pair = (user1.id, user2.id)
        if pair in existing_pairs:
            continue

        relation = Relation(
            id=generate_uuid7(), follower_id=user1.id, following_id=user2.id
        )

        try:
            session.add(relation)
            session.flush()
            existing_pairs.add(pair)
        except Exception as err:
            print("⚠️ Seed error:", err)
            continue

    print(f"\n✅ Finish seeding relations. Total -> {len(existing_pairs)}")


def seed():
    with Session(engine) as session:
        print("\n🌱 Start seeding...")

        users = seed_users(session)
        posts = seed_posts(session, users)
        seed_replies(session, users, posts)
        seed_likes(session, users, posts)
        seed_bookmarks(session, users, posts)
        seed_relations(session, users)

        session.commit()

        print("\n 🎉Database seeded successfully.🎉")


seed()
