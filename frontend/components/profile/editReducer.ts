import type { UserI } from '@/types';

type EditableTextField = 'name' | 'bio' | 'birthday';
type EditableImageField = 'avatar' | 'banner';

export interface EditState {
  inputValues: {
    name: string;
    bio: string;
    birthday: string;
    country: string;
  };
  inputErrs: Partial<
    Record<EditableTextField | EditableImageField | 'country', string>
  >;
  inputFiles: Record<EditableImageField, File | null>;
  previews: Record<EditableImageField, string | null>;
}

export function initState(user: UserI): EditState {
  return {
    inputValues: {
      name: user.profile.name,
      bio: user.profile.bio ?? '',
      birthday: user.profile.birthday?.split('T')[0] ?? '',
      country: user.profile.country ?? '',
    },
    inputErrs: {},
    inputFiles: { avatar: null, banner: null },
    previews: {
      avatar: user.profile.avatar_url ?? null,
      banner: user.profile.banner_url ?? null,
    },
  };
}

function validateInput(name: EditableTextField, value: string): string | null {
  if (name === 'name') {
    if (!value.trim()) return 'Name is required.';
    if (value.trim().length > 50) return 'Name must be at most 50 characters.';
    return null;
  }

  if (name === 'bio' && value.trim().length > 255) {
    return 'Bio must be at most 255 characters.';
  }

  if (name === 'birthday' && value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Invalid birthday date.';
  }

  return null;
}

function validateImage(name: EditableImageField, file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return `${name === 'avatar' ? 'Avatar' : 'Banner'} must be an image.`;
  }

  const ONE_MB = 1024 * 1024;

  if (file.size > 10 * ONE_MB) {
    return `${name === 'avatar' ? 'Avatar' : 'Banner'} size must be 10MB max.`;
  }

  return null;
}

export const EDIT_ACTIONS = {
  UPDATE_INPUT: 'update_input',
  UPDATE_COUNTRY: 'update_country',
  UPDATE_FILE: 'update_file',
  UPDATE_PREVIEW: 'update_preview',
} as const;

type UpdateInputAction = {
  type: typeof EDIT_ACTIONS.UPDATE_INPUT;
  payload: { name: EditableTextField; value: string };
};

type UpdateCountryAction = {
  type: typeof EDIT_ACTIONS.UPDATE_COUNTRY;
  payload: string;
};

type UpdateFileAction = {
  type: typeof EDIT_ACTIONS.UPDATE_FILE;
  payload: { name: EditableImageField; file: File };
};

type UpdatePreviewAction = {
  type: typeof EDIT_ACTIONS.UPDATE_PREVIEW;
  payload: { name: EditableImageField; preview: string };
};

export type EditAction =
  | UpdateInputAction
  | UpdateCountryAction
  | UpdateFileAction
  | UpdatePreviewAction;

export function editReducer(state: EditState, action: EditAction): EditState {
  switch (action.type) {
    case EDIT_ACTIONS.UPDATE_INPUT: {
      const { name, value } = action.payload;
      const inputValues = { ...state.inputValues, [name]: value };
      const inputErrs = { ...state.inputErrs };
      const validationError = validateInput(name, value);

      if (validationError) {
        inputErrs[name] = validationError;
      } else {
        delete inputErrs[name];
      }

      return { ...state, inputValues, inputErrs };
    }

    case EDIT_ACTIONS.UPDATE_COUNTRY: {
      return {
        ...state,
        inputValues: { ...state.inputValues, country: action.payload },
      };
    }

    case EDIT_ACTIONS.UPDATE_FILE: {
      const { name, file } = action.payload;
      const inputErrs = { ...state.inputErrs };
      const inputFiles = { ...state.inputFiles };
      const validationError = validateImage(name, file);

      if (validationError) {
        inputErrs[name] = validationError;
      } else {
        inputFiles[name] = file;
        delete inputErrs[name];
      }

      return { ...state, inputFiles, inputErrs };
    }

    case EDIT_ACTIONS.UPDATE_PREVIEW: {
      const { name, preview } = action.payload;
      return { ...state, previews: { ...state.previews, [name]: preview } };
    }

    default: {
      return state;
    }
  }
}
