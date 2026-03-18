import {
  editReducer,
  initState,
  EDIT_ACTIONS,
  EditState,
} from '@/components/profile/editReducer';
import type { UserI } from '@/types';

const mockUser: UserI = {
  id: 'user-1',
  username: 'alice',
  email: 'alice@example.com',
  created_at: '2024-01-01T00:00:00Z',
  profile: {
    id: 'profile-1',
    user_id: 'user-1',
    name: 'Alice Smith',
    bio: 'Hello world',
    birthday: '1995-06-15T00:00:00Z',
    country: 'CI',
    avatar_url: 'https://example.com/avatar.jpg',
    banner_url: null,
  },
};

describe('initState', () => {
  it('sets name from profile', () => {
    expect(initState(mockUser).inputValues.name).toBe('Alice Smith');
  });

  it('sets bio from profile', () => {
    expect(initState(mockUser).inputValues.bio).toBe('Hello world');
  });

  it('strips time from birthday', () => {
    expect(initState(mockUser).inputValues.birthday).toBe('1995-06-15');
  });

  it('defaults bio to empty string when null', () => {
    const user = { ...mockUser, profile: { ...mockUser.profile, bio: null } };
    expect(initState(user).inputValues.bio).toBe('');
  });

  it('sets avatar preview from profile url', () => {
    expect(initState(mockUser).previews.avatar).toBe(
      'https://example.com/avatar.jpg',
    );
  });

  it('sets banner preview to null when not set', () => {
    expect(initState(mockUser).previews.banner).toBeNull();
  });

  it('initializes with no errors', () => {
    expect(initState(mockUser).inputErrs).toEqual({});
  });

  it('initializes files as null', () => {
    const state = initState(mockUser);
    expect(state.inputFiles.avatar).toBeNull();
    expect(state.inputFiles.banner).toBeNull();
  });
});

describe('editReducer — UPDATE_INPUT', () => {
  let state: EditState;

  beforeEach(() => {
    state = initState(mockUser);
  });

  it('updates name value', () => {
    const next = editReducer(state, {
      type: EDIT_ACTIONS.UPDATE_INPUT,
      payload: { name: 'name', value: 'Bob' },
    });
    expect(next.inputValues.name).toBe('Bob');
  });

  it('sets error when name is empty', () => {
    const next = editReducer(state, {
      type: EDIT_ACTIONS.UPDATE_INPUT,
      payload: { name: 'name', value: '' },
    });
    expect(next.inputErrs.name).toBe('Name is required.');
  });

  it('sets error when name exceeds 50 characters', () => {
    const next = editReducer(state, {
      type: EDIT_ACTIONS.UPDATE_INPUT,
      payload: { name: 'name', value: 'a'.repeat(51) },
    });
    expect(next.inputErrs.name).toBe('Name must be at most 50 characters.');
  });

  it('clears name error when value becomes valid', () => {
    const withError = editReducer(state, {
      type: EDIT_ACTIONS.UPDATE_INPUT,
      payload: { name: 'name', value: '' },
    });
    const fixed = editReducer(withError, {
      type: EDIT_ACTIONS.UPDATE_INPUT,
      payload: { name: 'name', value: 'Alice' },
    });
    expect(fixed.inputErrs.name).toBeUndefined();
  });

  it('sets error when bio exceeds 255 characters', () => {
    const next = editReducer(state, {
      type: EDIT_ACTIONS.UPDATE_INPUT,
      payload: { name: 'bio', value: 'x'.repeat(256) },
    });
    expect(next.inputErrs.bio).toBe('Bio must be at most 255 characters.');
  });
});

describe('editReducer — UPDATE_COUNTRY', () => {
  it('updates country value', () => {
    const state = initState(mockUser);
    const next = editReducer(state, {
      type: EDIT_ACTIONS.UPDATE_COUNTRY,
      payload: 'US',
    });
    expect(next.inputValues.country).toBe('US');
  });
});

describe('editReducer — UPDATE_FILE', () => {
  let state: EditState;

  beforeEach(() => {
    state = initState(mockUser);
  });

  it('sets avatar file when valid', () => {
    const file = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' });
    const next = editReducer(state, {
      type: EDIT_ACTIONS.UPDATE_FILE,
      payload: { name: 'avatar', file },
    });
    expect(next.inputFiles.avatar).toBe(file);
    expect(next.inputErrs.avatar).toBeUndefined();
  });

  it('sets error when file is not an image', () => {
    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    const next = editReducer(state, {
      type: EDIT_ACTIONS.UPDATE_FILE,
      payload: { name: 'avatar', file },
    });
    expect(next.inputErrs.avatar).toBe('Avatar must be an image.');
    expect(next.inputFiles.avatar).toBeNull();
  });

  it('sets error when image exceeds 10MB', () => {
    const bigFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.jpg', {
      type: 'image/jpeg',
    });
    const next = editReducer(state, {
      type: EDIT_ACTIONS.UPDATE_FILE,
      payload: { name: 'banner', file: bigFile },
    });
    expect(next.inputErrs.banner).toBe('Banner size must be 10MB max.');
  });
});

describe('editReducer — UPDATE_PREVIEW', () => {
  it('updates avatar preview', () => {
    const state = initState(mockUser);
    const next = editReducer(state, {
      type: EDIT_ACTIONS.UPDATE_PREVIEW,
      payload: { name: 'avatar', preview: 'data:image/jpeg;base64,abc' },
    });
    expect(next.previews.avatar).toBe('data:image/jpeg;base64,abc');
  });
});
