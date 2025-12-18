import {
  type PagedResultOfUserGameBoardDto,
  type UserGameBoardDto,
  type UserGameBoardHistoryDto,
} from '../generated-ts-client';
import { extractApiErrors } from '../api/extractApiErrors';
import { useLoading } from './useLoading';
import { userBoardClient } from '../api/APIClients';
import { useAuthContext } from '../contexts/AuthContext';

type useUserBoardTypes = {
  getAll(
    activeFilter: boolean | null,
    page: number,
    pageSize: number
  ): Promise<PagedResultOfUserGameBoardDto>;
  create(numbers: number[], repeatCount: number): Promise<UserGameBoardDto>;
  deactivate(boardId: string): Promise<boolean>;
  history(boardId: string): Promise<UserGameBoardHistoryDto[]>;
  isCreateLoading: boolean;
  isDeactivateLoading: boolean;
  isLoading: boolean;
};

export const useUserBoards = (): useUserBoardTypes => {
  const { isLoading, withLoading } = useLoading();
  const { isLoading: isCreateLoading, withLoading: withCreateLoading } = useLoading();
  const { isLoading: isDeactivateLoading, withLoading: withDeactivateLoading } = useLoading();

  const { makeApiCall } = useAuthContext();

  const getAll = async (
    activeFilter: boolean | null,
    page: number,
    pageSize: number
  ): Promise<PagedResultOfUserGameBoardDto> => {
    // prøv at kald backend og se om vi kan logge brugeren ind
    try {
      const response = await withLoading(() =>
        makeApiCall(() => userBoardClient.getAllUserBoards(activeFilter, page, pageSize))
      );

      var allBoards = response;
      if (allBoards == null) {
        throw new Error('Ingen bræt fundet');
      }

      return allBoards;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  const create = async (numbers: number[], repeatCount: number): Promise<UserGameBoardDto> => {
    // prøv at kald backend og se om vi kan logge brugeren ind
    try {
      const response = await withCreateLoading(() =>
        makeApiCall(() => userBoardClient.createUserBoard({ numbers, repeatCount }))
      );

      var createdBoard = response.value;
      if (createdBoard == null) {
        throw new Error('Bræt blev ikke oprettet');
      }

      return createdBoard;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  const deactivate = async (boardId: string): Promise<boolean> => {
    // prøv at kald backend og se om vi kan logge brugeren ind
    try {
      const response = await withDeactivateLoading(() =>
        makeApiCall(() => userBoardClient.deactivateUserBoard(boardId))
      );

      var deactivatedBoard = response.value;
      if (deactivatedBoard == null) {
        throw new Error('Bræt blev ikke deaktiveret');
      }

      return deactivatedBoard;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  const history = async (boardId: string): Promise<UserGameBoardHistoryDto[]> => {
    // prøv at kald backend og se om vi kan logge brugeren ind
    try {
      const response = await withDeactivateLoading(() =>
        makeApiCall(() => userBoardClient.getUserBoardDetails(boardId))
      );

      var historyBoards = response.value;
      if (historyBoards == null) {
        throw new Error('Ingen historik fundet');
      }

      return historyBoards;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  return {
    getAll,
    create,
    deactivate,
    history,
    isCreateLoading,
    isDeactivateLoading,
    isLoading,
  };
};
