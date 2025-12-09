import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import type { UserDto } from '../generated-ts-client';

export const TOKEN_KEY = 'token';
export const jwtAtom = atomWithStorage<string | null>(TOKEN_KEY, null);

export const userAtom = atom<UserDto | null>(null);
