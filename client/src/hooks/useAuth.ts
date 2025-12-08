import { useAtom } from 'jotai';
import { ApiException, type UserDto } from '../generated-ts-client';
import { jwtAtom } from '../atoms/auth';
import { authClient } from '../api/APIClients';
import { useState } from 'react';
import { errorToMessage } from '../helpers/errorToMessage';
import { extractApiErrors } from '../api/extractApiErrors';
import { useLoading } from './useLoading';

type useAuthTypes = {
  requestLogin(email: string): Promise<boolean>;
  verify(token: string): Promise<string>;
  refresh: string;
  me: UserDto | null;
  logout(): void;
  isLoading: boolean;
};

export const useAuth = (): useAuthTypes => {
  const [_, setJwt] = useAtom(jwtAtom);
  const { isLoading, withLoading } = useLoading();
  const [errors, setErrors] = useState<string[] | null>();

  // anmod om at modtage token
  const requestLogin = async (email: string): Promise<boolean> => {
    // prøv at kald backend og se om vi kan logge brugeren ind
    try {
      const response = await withLoading(() => authClient.login({ email }));
      return response.value;

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

  const verify = async (token: string): Promise<string> => {
    try {
      const response = await withLoading(() => authClient.verify({ token }));

      var accessToken = response.value;

      if (!accessToken) {
        throw new Error('Ingen token modtaget');
      }

      setJwt(accessToken);
      return accessToken;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  const refresh = '';

  const me = null;

  const logout = (): void => {};

  return {
    requestLogin,
    verify,
    refresh,
    me,
    logout,
    isLoading,
  };
};
