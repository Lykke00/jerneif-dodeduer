import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { useModal } from '../../contexts/ModalContext';
import { errorToMessage } from '../../helpers/errorToMessage';
import { Spinner } from '@heroui/react';
import { motion } from 'framer-motion';
import ErrorState from '../../components/common/ErrorState';

export const AuthVerify = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { verify, isLoading } = useAuth();
  const [errors, setErrors] = useState<string>();

  useEffect(() => {
    if (!token) return;

    const run = async () => {
      try {
        await verify(token);
      } catch (e) {
        setErrors(errorToMessage(e));
      }
    };

    run();
  }, [token]);

  return (
    <div className="w-full pt-8 flex flex-col items-center justify-center bg-background select-none">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center gap-6"
      >
        {isLoading && (
          <>
            <Spinner size="lg" />
            <p className="text-lg font-medium text-foreground-700">Bekræfter login…</p>
            <p className="text-sm text-foreground-500">Vent venligst et øjeblik</p>
          </>
        )}

        {!isLoading && errors && <ErrorState title="En fejl opstod" message={`${errors}`} />}
      </motion.div>
    </div>
  );
};
