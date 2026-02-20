import { create } from 'zustand';

type AppState = {
  createPostAreaIsOpen: boolean;
};

type AppAction = {
  setCreateAreaIsOpen: (value: boolean) => void;
};
type AppStore = AppAction & AppState;

const initialState = {
  createPostAreaIsOpen: false,
};

const useAppStore = create<AppStore>()((set) => ({
  ...initialState,
  setCreateAreaIsOpen: (value: boolean) => set({ createPostAreaIsOpen: value }),
}));

export default useAppStore;
