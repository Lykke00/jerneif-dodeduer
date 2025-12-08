'use client';

import { Button } from '@heroui/react';
import * as Icons from 'react-icons/fi';

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Icons;
  variant?: 'default' | 'compact';
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  contactUrl?: string;
  showBackButton?: boolean;
  showContactButton?: boolean;
  showButtons?: boolean;
}

export default function ErrorState({
  title = 'Noget gik galt',
  message = 'Vi kunne ikke indlæse indholdet. Prøv igen senere.',
  icon = 'FiAlertTriangle',
  variant = 'default',
  onRetry,
  retryLabel = 'Prøv igen',
  className = '',
  contactUrl = '/kontakt',
  showBackButton = true,
  showContactButton = true,
  showButtons = true,
}: ErrorStateProps) {
  // React-Icons component lookup
  const IconComponent = Icons[icon] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
  const isCompact = variant === 'compact';

  const handleGoBack = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/';
  };

  const handleContact = () => {
    window.location.href = contactUrl;
  };

  const showAnyButton = showButtons && (onRetry || showBackButton || showContactButton);

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        isCompact ? 'py-6 px-4 space-y-2' : 'py-12 px-6 space-y-4'
      } ${className}`}
    >
      {IconComponent && (
        <IconComponent
          className={`${
            isCompact
              ? 'w-6 h-6 text-zinc-500 dark:text-zinc-400 mb-1'
              : 'w-10 h-10 text-red-500 dark:text-red-400 mb-2'
          }`}
        />
      )}

      <h2
        className={`font-semibold text-zinc-900 dark:text-white ${
          isCompact ? 'text-base' : 'text-xl'
        }`}
      >
        {title}
      </h2>

      {message && (
        <p
          className={`text-zinc-600 dark:text-zinc-400 max-w-md ${
            isCompact ? 'text-sm' : 'text-base'
          }`}
        >
          {message}
        </p>
      )}

      {showAnyButton && (
        <div className={`flex flex-wrap justify-center gap-3 ${isCompact ? 'mt-2' : 'mt-4'}`}>
          {onRetry && (
            <Button
              color="primary"
              variant="flat"
              onPress={onRetry}
              className="flex items-center gap-2"
            >
              <Icons.FiRefreshCw className="w-4 h-4" />
              {retryLabel}
            </Button>
          )}

          {showBackButton && (
            <Button
              variant="bordered"
              color="default"
              onPress={handleGoBack}
              className="flex items-center gap-2"
            >
              <Icons.FiArrowLeft className="w-4 h-4" />
              Gå tilbage
            </Button>
          )}

          {showContactButton && (
            <Button
              color="secondary"
              variant="flat"
              onPress={handleContact}
              className="flex items-center gap-2"
            >
              <Icons.FiMail className="w-4 h-4" />
              Kontakt os
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
