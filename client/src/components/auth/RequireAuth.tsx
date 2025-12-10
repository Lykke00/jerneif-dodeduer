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

type RequireAuthProps = {
  element?: React.ReactElement;
  children?: React.ReactNode;
  accessLevel?: AccessLevelType;
};

export function RequireAuth({
  element,
  children,
  accessLevel = AccessLevel.Protected,
}: RequireAuthProps) {
  const { user, isInitializing } = useAuthContext();

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

  return <>{children ?? element}</>;
}
