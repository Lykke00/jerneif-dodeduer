import {
  type PagedResultOfUserDtoExtended,
  type UpdateUserRequest,
  type UserDtoExtended,
} from '../generated-ts-client';
import { extractApiErrors } from '../api/extractApiErrors';
import { useLoading } from './useLoading';
import { userClient } from '../api/APIClients';
import { useAuthContext } from '../contexts/AuthContext';
import { useCallback } from 'react';

type UpdateUserInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  active?: boolean;
  admin?: boolean;
};

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
  update(id: string, changes: UpdateUserInput): Promise<UserDtoExtended>;
  isUpdateLoading: boolean;
  isLoading: boolean;
};

export const useUsers = (): useUsersTypes => {
  const { isLoading, withLoading } = useLoading();
  const { isLoading: isUpdateLoading, withLoading: withUpdateLoading } = useLoading();

  const { makeApiCall } = useAuthContext();

  const getAll = useCallback(
    async (
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
    },
    [withLoading, makeApiCall]
  );

  const create = useCallback(
    async (
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
    },
    [withLoading, makeApiCall]
  );

  function toUpdateUserRequest(input: UpdateUserInput): UpdateUserRequest {
    return {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      active: input.active,
      admin: input.admin,
    };
  }

  const update = useCallback(
    async (id: string, changes: UpdateUserInput): Promise<UserDtoExtended> => {
      const request = toUpdateUserRequest(changes);

      const response = await withUpdateLoading(() =>
        makeApiCall(() => userClient.update(id, request))
      );
      var updateUser = response.value;
      if (updateUser == null) {
        throw new Error('Brugeren blev ikke opdateret');
      }

      return updateUser;
    },
    [withUpdateLoading, makeApiCall]
  );

  return {
    getAll,
    create,
    update,
    isUpdateLoading,
    isLoading,
  };
};
