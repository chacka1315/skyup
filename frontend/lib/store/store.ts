import { create } from 'zustand';

type UsersTabSelection = 'followers' | 'followings' | 'all';

type AppState = {
  createPostAreaIsOpen: boolean;
  selectedUsersTab: UsersTabSelection;
};

type AppAction = {
  setCreateAreaIsOpen: (value: boolean) => void;
  setSelectedUsersTab: (value: UsersTabSelection) => void;
};

type AppStore = AppAction & AppState;

const initialState: AppState = {
  createPostAreaIsOpen: false,
  selectedUsersTab: 'followers',
};

const useAppStore = create<AppStore>()((set) => ({
  ...initialState,
  setCreateAreaIsOpen: (value: boolean) => set({ createPostAreaIsOpen: value }),
  setSelectedUsersTab: (value) => set({ selectedUsersTab: value }),
}));

export default useAppStore;
