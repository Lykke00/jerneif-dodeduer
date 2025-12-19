import { useAtom } from 'jotai';
import { type UserDto } from '../generated-ts-client';
import { jwtAtom, userAtom } from '../atoms/auth';
import { authClient } from '../api/APIClients';
import { useEffect, useState } from 'react';
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
  isInitializing: boolean;
};

export const useAuth = (): useAuthTypes => {
  const [jwt, setJwt] = useAtom(jwtAtom);
  const [user, setUser] = useAtom(userAtom);

  // LATCH – VI VENTER PÅ AT HAVE FORSØGT ME()
  const [hasAttemptedInit, setHasAttemptedInit] = useState(false);

  const navigate = useNavigate();
  const { isLoading, withLoading } = useLoading();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

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

  const requestLogin = async (email: string): Promise<boolean> => {
    try {
      const response = await withLoading(() => authClient.login({ email }));
      return response.value;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) throw new Error(apiError);
      throw e;
    }
  };

  const verify = async (token: string): Promise<string> => {
    try {
      const response = await withLoading(() => authClient.verify({ token }));

      const accessToken = response.value?.token;
      const u = response.value?.user;

      if (!accessToken) throw new Error('Ingen token');
      if (!u) throw new Error('Ingen user');

      setJwt(accessToken);
      setUser(u);

      navigate(PageRoutes.Game);

      return accessToken;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) throw new Error(apiError);
      throw e;
    }
  };

  const refresh = async (): Promise<string> => {
    try {
      const response = await authClient.refresh();
      const accessToken = response.value?.token;
      const u = response.value?.user;
      if (!accessToken || !u) throw new Error('Refresh fejl');
      setJwt(accessToken);
      setUser(u);
      return accessToken;
    } catch {
      logout();
      throw new Error('Refresh fejl');
    }
  };

  const me = async (): Promise<UserDto | null> => {
    try {
      const response = await withLoading(() => makeApiCall(() => authClient.me()));
      const u = response.value;
      if (!u) throw new Error('Ingen user fra me()');

      if (user != null && u.isAdmin != user?.isAdmin) {
        refresh();
      }

      setUser(u);

      return u;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) throw new Error(apiError);
      throw e;
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      const response = await withLoading(() => authClient.logout());
      setJwt(null);
      setUser(null);
      navigate(PageRoutes.Home);
      return response.value;
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) throw new Error(apiError);
      throw e;
    }
  };

  // ----------- INITIALISERING MED LATCH ----------------

  // hydratione r skyld i at den redirected før den burde...
  // dette burde løse det
  useEffect(() => {
    if (!hydrated) return;
    async function init() {
      if (!jwt) {
        setHasAttemptedInit(true);
        return;
      }
      try {
        await me();
      } finally {
        setHasAttemptedInit(true);
      }
    }
    init();
  }, [hydrated, jwt]);

  // -----------------------------------------------------

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
    isInitializing: !hasAttemptedInit,
  };
};
