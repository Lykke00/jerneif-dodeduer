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
  const { user, isInitializing } = useAuthContext();

  console.log('[RequireAuth]', { user, isInitializing, accessLevel });

  // vi MÅ IKKE redirecte før init er forsøgt
  if (isInitializing) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (user && accessLevel === AccessLevel.Anonymous) {
    return <Navigate to={PageRoutes.Game} replace />;
  }

  if (!user && accessLevel !== AccessLevel.Anonymous) {
    return <Navigate to={PageRoutes.Login} replace />;
  }

  if (user && !canAccess(accessLevel, user)) {
    return <Navigate to={PageRoutes.Forbidden} replace />;
  }

  return element;
}
