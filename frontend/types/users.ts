export interface PostAuthorProfileI {
  name: string;
  avatar_url: string | null;
}

export interface PostAuthorI {
  username: string;
  email: string;
  id: string;
  created_at: string;
  is_followed: boolean;
  profile: PostAuthorProfileI;
}

export interface UserProfileI extends PostAuthorProfileI {
  country: string | null;
  birthday: string | null;
  bio: string | null;
  id: string;
  user_id: string;
  banner_url: string | null;
}

export interface UserI {
  username: string;
  email: string;
  id: string;
  is_followed_by_me?: boolean;
  is_following_me?: boolean;
  created_at: string;
  profile: {
    name: string;
    country?: string | null;
    birthday?: string | null;
    bio?: string | null;
    id: string;
    user_id: string;
    avatar_url: string | null;
    banner_url?: string | null;
  };
}

export type UserCardT = 'follower' | 'following' | 'all';
