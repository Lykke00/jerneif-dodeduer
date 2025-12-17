import {
  type PagedResultOfUserDtoExtended,
  type PagedResultOfUserGameBoardDto,
  type UpdateUserRequest,
  type UserDtoExtended,
  type UserGameBoardDto,
} from '../generated-ts-client';
import { extractApiErrors } from '../api/extractApiErrors';
import { useLoading } from './useLoading';
import { userBoardClient } from '../api/APIClients';
import { useAuthContext } from '../contexts/AuthContext';

type useUserBoardTypes = {
  getAll(page: number, pageSize: number): Promise<PagedResultOfUserGameBoardDto>;
  create(numbers: number[], amount: number, repeatCount: number): Promise<UserGameBoardDto>;
  isCreateLoading: boolean;
  isLoading: boolean;
};

export const useUserBoards = (): useUserBoardTypes => {
  const { isLoading, withLoading } = useLoading();
  const { isLoading: isCreateLoading, withLoading: withCreateLoading } = useLoading();

  const { makeApiCall } = useAuthContext();

  const getAll = async (page: number, pageSize: number): Promise<PagedResultOfUserGameBoardDto> => {
    // prøv at kald backend og se om vi kan logge brugeren ind
    try {
      const response = await withLoading(() =>
        makeApiCall(() => userBoardClient.getAllUserBoards(page, pageSize))
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

  const create = async (
    numbers: number[],
    amount: number,
    repeatCount: number
  ): Promise<UserGameBoardDto> => {
    // prøv at kald backend og se om vi kan logge brugeren ind
    try {
      const response = await withCreateLoading(() =>
        makeApiCall(() => userBoardClient.createUserBoard({ numbers, amount, repeatCount }))
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

  return {
    getAll,
    create,
    isCreateLoading,
    isLoading,
  };
};
