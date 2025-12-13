import type { FormEvent } from 'react';
import { useModal } from '../../contexts/ModalContext';
import { useDeposit } from '../../hooks';
import type { Deposit } from '../../types/Deposit';
import { errorToMessage } from '../../helpers/errorToMessage';
import DepositForm from '../../components/deposit/DepositForm';

export default function DepositPage() {
  const { deposit } = useDeposit();
  const { showModal } = useModal();

  const onSubmit = async (e: FormEvent<HTMLFormElement>, d: Deposit) => {
    e.preventDefault();

    try {
      await deposit(d.amount, d.id, d.file);
      showModal({
        variant: 'success',
        title: 'Indbetaling oprettet',
        description: 'Afventer godkendelse',
      });
    } catch (e) {
      showModal({
        variant: 'error',
        title: 'En fejl opstod',
        description: errorToMessage(e),
      });
    }
  };

  return <DepositForm onSubmit={onSubmit} submitting={false} />;
}
