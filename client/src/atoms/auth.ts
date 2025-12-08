import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import type { UserDto } from '../generated-ts-client';

export const TOKEN_KEY = 'token';
export const tokenStorage = createJSONStorage<string | null>(() => localStorage);

export const jwtAtom = atomWithStorage<string | null>(TOKEN_KEY, null, tokenStorage);

export const userAtom = atom<UserDto | null>(null);
