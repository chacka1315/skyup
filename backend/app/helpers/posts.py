from ..schemas import PostAuthorProfile, PostAuthor, PostMetrics


def get_post_metrics(post_res):
    likes_count = post_res[1]
    replies_count = post_res[2]
    bookmarks_count = post_res[3]
    is_bookmarked_by_me = post_res[4]
    is_liked_by_me = post_res[5]
    author_profile = PostAuthorProfile(**post_res[0].author.profile.model_dump())
    author = PostAuthor(**post_res[0].author.model_dump(), profile=author_profile)

    return PostMetrics(
        likes_count=likes_count,
        replies_count=replies_count,
        bookmarks_count=bookmarks_count,
        is_bookmarked_by_me=is_bookmarked_by_me,
        is_liked_by_me=is_liked_by_me,
        author=author,
    )
