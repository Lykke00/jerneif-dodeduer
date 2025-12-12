import { type PagedResultOfUserDtoExtended, type UserDtoExtended } from '../generated-ts-client';
import { extractApiErrors } from '../api/extractApiErrors';
import { useLoading } from './useLoading';
import { userClient } from '../api/APIClients';
import { useAuthContext } from '../contexts/AuthContext';
import { act } from 'react';

type useUsersTypes = {
  getAll(
    search: string,
    page: number,
    pageSize: number,
    active?: boolean
  ): Promise<PagedResultOfUserDtoExtended>;
  create(
    firstName: string,
    lastName: string,
    phone: string,
    email: string,
    admin: boolean
  ): Promise<UserDtoExtended>;
  update(id: string, active?: boolean, admin?: boolean): Promise<UserDtoExtended>;
  isLoading: boolean;
};

export const useUsers = (): useUsersTypes => {
  const { isLoading, withLoading } = useLoading();
  const { makeApiCall } = useAuthContext();

  const getAll = async (
    search: string,
    page: number,
    pageSize: number,
    active?: boolean
  ): Promise<PagedResultOfUserDtoExtended> => {
    // prøv at kald backend og se om vi kan logge brugeren ind
    try {
      const response = await withLoading(() =>
        makeApiCall(() => userClient.getUsers(search, active, page, pageSize))
      );

      var allUsers = response;
      if (allUsers == null) {
        throw new Error('Ingen brugere fundet');
      }

      return allUsers;
      // hvis en fejl sker, så extract fejlene og kast en error så vores
      // visningsside kan håndtere den korrekt med try catch.
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  const create = async (
    firstName: string,
    lastName: string,
    phone: string,
    email: string,
    admin: boolean
  ): Promise<UserDtoExtended> => {
    try {
      const response = await withLoading(() =>
        makeApiCall(() => userClient.createUser({ firstName, lastName, phone, email, admin }))
      );

      var createdUser = response.value;
      if (createdUser == null) {
        throw new Error('Brugeren blev ikke oprettet');
      }

      return createdUser;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  const update = async (
    id: string,
    active?: boolean,
    admin?: boolean
  ): Promise<UserDtoExtended> => {
    try {
      const response = await withLoading(() =>
        makeApiCall(() => userClient.update(id, { active: active, admin: admin }))
      );

      var updatedUser = response.value;
      if (updatedUser == null) {
        throw new Error('Brugeren blev ikke opdateret');
      }

      return updatedUser;
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
    update,
    isLoading,
  };
};
