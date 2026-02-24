import type { PostAuthorI } from './users';

export interface PostI {
  content: string;
  id: string;
  author_id: string;
  media_url: string | null;
  media_type: 'image' | 'video' | null;
  created_at: string;
  likes_count: number;
  replies_count: number;
  bookmarks_count: number;
  is_liked_by_me: boolean;
  is_bookmarked_by_me: boolean;
  author: PostAuthorI;
}

export interface ReplyI {
  post_id: string;
  created_at: string;
  content: string;
  id: string;
  author_id: string;
  author: PostAuthorI;
}
