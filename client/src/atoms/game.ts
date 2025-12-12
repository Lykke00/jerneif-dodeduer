import { atom } from 'jotai';
import type { GameDto } from '../generated-ts-client';

export const gameAtom = atom<GameDto | null>(null);
