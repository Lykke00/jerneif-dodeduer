import { useAtom } from 'jotai';
import { type UserDto } from '../generated-ts-client';
import { jwtAtom, userAtom } from '../atoms/auth';
import { authClient } from '../api/APIClients';
import { useState } from 'react';
import { extractApiErrors } from '../api/extractApiErrors';
import { useLoading } from './useLoading';
import { useNavigate } from 'react-router-dom';
import { PageRoutes } from '../PageRoutes';

type useAuthTypes = {
  requestLogin(email: string): Promise<boolean>;
  verify(token: string): Promise<string>;
  refresh(): Promise<string>;
  user: UserDto | null;
  logout(): void;
  me(): Promise<UserDto | null>;
  jwt: string | null;
  makeApiCall: <T>(fn: () => Promise<T>) => Promise<T>;
  isLoading: boolean;
};

export const useAuth = (): useAuthTypes => {
  const [jwt, setJwt] = useAtom(jwtAtom);
  const [user, setUser] = useAtom(userAtom);

  const navigate = useNavigate();
  const { isLoading, withLoading } = useLoading();
  const [errors, setErrors] = useState<string[] | null>();

  const makeApiCall = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      return await fn();
    } catch (err: any) {
      if (err?.status === 401 || err?.response?.status === 401) {
        try {
          await refresh();
          return await fn();
        } catch {
          logout();
          throw err;
        }
      }
      throw err;
    }
  };

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

      var accessToken = response.value?.token;
      var user = response.value?.user;

      if (!accessToken) {
        throw new Error('Ingen token modtaget');
      }

      if (!user) {
        throw new Error('Ingen bruger modtaget');
      }

      console.log('tokeN: ', accessToken);

      setJwt(accessToken);
      setUser(user);

      navigate(PageRoutes.Game);
      return accessToken;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  const refresh = async (): Promise<string> => {
    try {
      const response = await authClient.refresh();

      const accessToken = response.value?.token;
      const user = response.value?.user;

      if (!accessToken) throw new Error('Ingen token fra refresh');
      if (!user) throw new Error('Ingen user fra refresh');

      setJwt(accessToken);
      setUser(user);

      return accessToken;
    } catch {
      logout();
      throw new Error('Kunne ikke refreshe token');
    }
  };

  const me = async (): Promise<UserDto | null> => {
    try {
      const response = await withLoading(() => makeApiCall(() => authClient.me()));

      const user = response.value;
      if (!user) throw new Error('Ingen user fra refresh');

      setUser(user);
      return user;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      const response = await withLoading(() => authClient.logout());

      navigate(PageRoutes.Home);
      return response.value;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  return {
    requestLogin,
    verify,
    refresh,
    user,
    logout,
    me,
    jwt,
    makeApiCall,
    isLoading,
  };
};
