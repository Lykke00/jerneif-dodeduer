import {
  type DepositResponse,
  type GameDto,
  type GetDepositsResponse,
  type PagedResultOfGetDepositsResponse,
} from '../generated-ts-client';
import { extractApiErrors } from '../api/extractApiErrors';
import { useLoading } from './useLoading';
import { depositClient, gameClient } from '../api/APIClients';
import { useAuthContext } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { gameAtom } from '../atoms/game';

type useGameTypes = {
  getCurrent: () => Promise<GameDto>;
  game: GameDto | null;
  isLoading: boolean;
};

export const useGame = (): useGameTypes => {
  const { isLoading, withLoading } = useLoading();
  const { makeApiCall } = useAuthContext();
  const [game, setCurrentGame] = useAtom(gameAtom);

  const getCurrent = async (): Promise<GameDto> => {
    try {
      const response = await withLoading(() => makeApiCall(() => gameClient.getCurrentGame()));

      var game = response.value;
      if (game == null) {
        throw new Error('Ingen aktive spil fundet');
      }

      setCurrentGame(game);

      return game;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  return {
    getCurrent,
    game,
    isLoading,
  };
};
