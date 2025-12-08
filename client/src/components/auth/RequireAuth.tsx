import { Navigate } from 'react-router-dom';
import type { RouteProps } from 'react-router-dom';
import { useEffect } from 'react';
import { Spinner } from '@heroui/react';
import { useAuthContext } from '../../contexts/AuthContext';

import {
  AccessLevel,
  canAccess,
  type AccessLevel as AccessLevelType,
} from '../../helpers/authUtils';
import { PageRoutes } from '../../PageRoutes';

type RequireAuthProps = Omit<RouteProps, 'element'> & {
  element: React.ReactElement;
  accessLevel?: AccessLevelType;
};

export function RequireAuth({ element, accessLevel = AccessLevel.Protected }: RequireAuthProps) {
  const { user, isLoading } = useAuthContext();

  useEffect(() => {
    if (!user && accessLevel !== AccessLevel.Anonymous) {
      //localStorage.setItem(REDIRECT_PATH_KEY, window.location.pathname);
    }
  }, [user, accessLevel]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (!user && accessLevel !== AccessLevel.Anonymous) {
    return <Navigate to={PageRoutes.Login} replace />;
  }

  if (user && !canAccess(accessLevel, user)) {
    return <Navigate to={PageRoutes.Forbidden} replace />;
  }

  return element;
}
