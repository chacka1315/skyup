import { PostI } from '@/types';
import { create } from 'zustand';

type UsersTabSelection = 'followers' | 'followings' | 'all';

type AppState = {
  createPostAreaIsOpen: boolean;
  selectedUsersTab: UsersTabSelection;
  createReplyAreaIsOpen: boolean;
  postToReply: PostI | null;
};

type AppAction = {
  setCreatePostAreaIsOpen: (value: boolean) => void;
  setSelectedUsersTab: (value: UsersTabSelection) => void;
  setCreateReplyAreaIsOpen: (value: boolean) => void;
  setPostToReply: (post: PostI | null) => void;
};

type AppStore = AppAction & AppState;

const initialState: AppState = {
  createPostAreaIsOpen: false,
  selectedUsersTab: 'followers',
  createReplyAreaIsOpen: false,
  postToReply: null,
};

const useAppStore = create<AppStore>()((set) => ({
  ...initialState,
  setCreatePostAreaIsOpen: (value: boolean) => {
    if (value === true) {
      set({ createPostAreaIsOpen: value, createReplyAreaIsOpen: false });
    } else {
      set({ createPostAreaIsOpen: value });
    }
  },

  setSelectedUsersTab: (value) => set({ selectedUsersTab: value }),
  setCreateReplyAreaIsOpen: (value: boolean) => {
    if (value === true) {
      set({ createPostAreaIsOpen: false, createReplyAreaIsOpen: value });
    } else {
      set({ createReplyAreaIsOpen: value });
    }
  },

  setPostToReply: (post) => set({ postToReply: post }),
}));

export default useAppStore;
