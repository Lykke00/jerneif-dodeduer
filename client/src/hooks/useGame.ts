import {
  type DepositResponse,
  type GameDto,
  type GameUserPlayResponse,
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
import { userAtom } from '../atoms/auth';

type useGameTypes = {
  getCurrent: () => Promise<GameDto>;
  play: (amount: number, numbers: number[]) => Promise<GameUserPlayResponse>;
  game: GameDto | null;
  isSubmitLoading: boolean;
  isLoading: boolean;
};

export const useGame = (): useGameTypes => {
  const { isLoading, withLoading } = useLoading();
  const { isLoading: isSubmitLoading, withLoading: withSubmitLoading } = useLoading();

  const { makeApiCall } = useAuthContext();
  const [game, setCurrentGame] = useAtom(gameAtom);
  const [user, setUser] = useAtom(userAtom);

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

  const play = async (amount: number, numbers: number[]): Promise<GameUserPlayResponse> => {
    try {
      if (game == null) throw new Error('Intet aktiv spil fundet');

      const response = await withSubmitLoading(() =>
        makeApiCall(() => gameClient.playGame({ gameId: game.id, amount, numbers }))
      );

      var balanceUpdate = response.value;
      if (balanceUpdate == null) {
        throw new Error('En fejl skete ved at prøve og spille');
      }

      setUser((prev) => {
        if (!prev) return prev;

        const newBalance =
          typeof balanceUpdate?.newBalance === 'number' ? balanceUpdate?.newBalance : 0;

        return {
          ...prev,
          balance: newBalance,
        };
      });

      return balanceUpdate;
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
    play,
    game,
    isSubmitLoading,
    isLoading,
  };
};
