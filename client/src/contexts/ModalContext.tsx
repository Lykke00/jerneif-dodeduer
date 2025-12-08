import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { ModalOptions } from '../types/ModalOptions';
import { GeneralModal } from '../components/modal/GeneralModal';

type ModalContextValue = {
  showModal: (options: ModalOptions) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return ctx;
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<ModalOptions | null>(null);

  const showModal = useCallback((options: ModalOptions) => {
    setModal(options);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}

      {modal && (
        <GeneralModal
          variant={modal.variant}
          title={modal.title}
          description={modal.description}
          isOpen={true}
          onClose={closeModal}
        />
      )}
    </ModalContext.Provider>
  );
};
