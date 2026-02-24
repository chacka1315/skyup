from sqlmodel import func
from ..models import Post, Like, Bookmark, Reply, User, Relation
from sqlalchemy import select as sa_select

likes_count_subq = (
    sa_select(func.count(Like.id))
    .where(Post.id == Like.post_id)
    .scalar_subquery()
    .label("likes_count")
)

bookmarks_count_subq = (
    sa_select(func.count(Bookmark.id))
    .where(Bookmark.post_id == Post.id)
    .correlate(Post)
    .scalar_subquery()
    .label("bookmarks_count")
)


reply_count_subq = (
    sa_select(func.count(Reply.id))
    .where(Reply.post_id == Post.id)
    .scalar_subquery()
    .label("replies_count")
)


def get_is_liked_by_me_subq(current_user: User):
    return (
        sa_select(func.count(Like.id))
        .where(Like.post_id == Post.id)
        .where(Like.author_id == current_user.id)
        .scalar_subquery()
        .label("is_liked_by_me")
    )


def get_is_bookmarked_by_me_subq(current_user: User):
    return (
        sa_select(func.count(Bookmark.id))
        .where(Bookmark.post_id == Post.id)
        .where(Bookmark.owner_id == current_user.id)
        .correlate(Post)
        .scalar_subquery()
        .label("is_bookmarked_by_me")
    )
