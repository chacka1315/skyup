export interface PostAuthorProfileI {
  name: string;
  avatar_url: string | null;
}

export interface PostAuthorI {
  username: string;
  email: string;
  id: string;
  created_at: string;
  is_my_friend: boolean;
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

export interface UserI extends PostAuthorI {
  profile: UserProfileI;
}
