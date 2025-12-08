import { atomWithStorage, createJSONStorage } from 'jotai/utils';

export const TOKEN_KEY = 'token';
export const tokenStorage = createJSONStorage<string | null>(() => localStorage);

export const jwtAtom = atomWithStorage<string | null>(TOKEN_KEY, null, tokenStorage);
