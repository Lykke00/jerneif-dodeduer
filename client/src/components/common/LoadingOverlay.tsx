import { Spinner } from '@heroui/react';

export function LoadingOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(255,255,255,0.6)',
        zIndex: 9999,
      }}
    >
      <Spinner size="lg" />
    </div>
  );
}
