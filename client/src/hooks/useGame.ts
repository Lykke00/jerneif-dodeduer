import {
  type GameDto,
  type GameExtendedDto,
  type GameUserPlayResponse,
  type PagedResultOfGameExtendedDto,
  type PagedResultOfUserWinnerDto,
} from '../generated-ts-client';
import { extractApiErrors } from '../api/extractApiErrors';
import { useLoading } from './useLoading';
import { gameClient } from '../api/APIClients';
import { useAuthContext } from '../contexts/AuthContext';
import { useAtom } from 'jotai';
import { gameAtom } from '../atoms/game';
import { userAtom } from '../atoms/auth';

type useGameTypes = {
  getCurrent: () => Promise<GameDto>;
  play: (amount: number, numbers: number[]) => Promise<GameUserPlayResponse>;
  updateGame: (winningNumbers: number[]) => Promise<GameDto>;
  createGame: (weekNumber: number) => Promise<GameDto>;
  getAll: (page: number, pageSize: number) => Promise<PagedResultOfGameExtendedDto>;
  getGameWinners: (
    gameId: string,
    page: number,
    pageSize: number
  ) => Promise<PagedResultOfUserWinnerDto>;
  getGameInfo: (gameId: string) => Promise<GameExtendedDto>;
  game: GameDto | null;
  isSubmitLoading: boolean;
  isUpdateLoading: boolean;
  isCreateLoading: boolean;
  isLoading: boolean;
};

export const useGame = (): useGameTypes => {
  const { isLoading, withLoading } = useLoading();
  const { isLoading: isSubmitLoading, withLoading: withSubmitLoading } = useLoading();
  const { isLoading: isUpdateLoading, withLoading: withUpdateLoading } = useLoading();
  const { isLoading: isCreateLoading, withLoading: withCreateLoading } = useLoading();

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

  const updateGame = async (winningNumbers: number[]): Promise<GameDto> => {
    try {
      if (game == null) throw new Error('Intet aktiv spil fundet');

      const response = await withUpdateLoading(() =>
        makeApiCall(() => gameClient.updateGame(game.id, { winningNumbers }))
      );

      var gameUpdated = response.value;
      if (gameUpdated == null) {
        throw new Error('En fejl skete ved at opdatere spillet');
      }

      setCurrentGame(gameUpdated);

      return gameUpdated;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  const createGame = async (weekNumber: number): Promise<GameDto> => {
    try {
      const response = await withCreateLoading(() =>
        makeApiCall(() => gameClient.createGame({ weekNumber }))
      );

      var gameCreated = response.value;
      if (gameCreated == null) {
        throw new Error('En fejl skete ved at oprette et nyt spil');
      }

      setCurrentGame(gameCreated);

      return gameCreated;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  const getAll = async (page: number, pageSize: number): Promise<PagedResultOfGameExtendedDto> => {
    try {
      const response = await withLoading(() =>
        makeApiCall(() => gameClient.getAllGames(page, pageSize))
      );

      var allGames = response.items;
      if (allGames == null) {
        throw new Error('En fejl skete ved at hente alle spil');
      }

      return response;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  const getGameWinners = async (
    gameId: string,
    page: number,
    pageSize: number
  ): Promise<PagedResultOfUserWinnerDto> => {
    try {
      const response = await withLoading(() =>
        makeApiCall(() => gameClient.getWinners(gameId, { page, pageSize }))
      );

      var winners = response.items;
      if (winners == null) {
        throw new Error('En fejl skete ved at hente vindere for spil');
      }

      return response;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  const getGameInfo = async (gameId: string): Promise<GameExtendedDto> => {
    try {
      const response = await withLoading(() =>
        makeApiCall(() => gameClient.getGameDetails(gameId))
      );

      var game = response.value;
      if (game == null) {
        throw new Error('En fejl skete ved at hente spil');
      }

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
    play,
    updateGame,
    createGame,
    getAll,
    getGameWinners,
    getGameInfo,
    game,
    isSubmitLoading,
    isUpdateLoading,
    isCreateLoading,
    isLoading,
  };
};
