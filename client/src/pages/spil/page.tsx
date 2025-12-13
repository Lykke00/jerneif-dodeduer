import { addToast, Card, CardHeader, Spinner } from '@heroui/react';
import { useEffect } from 'react';
import { useGame } from '../../hooks';
import ErrorState from '../../components/common/ErrorState';
import GameForm from '../../components/game/GameForm';
import { useModal } from '../../contexts/ModalContext';
import { errorToMessage } from '../../helpers/errorToMessage';

export default function DeadPigeonsGame() {
  const { game, isLoading, isSubmitLoading, getCurrent, play } = useGame();
  const { showModal } = useModal();

  useEffect(() => {
    getCurrent();
  }, []);

  const formatNumbers = (numbers: number[]) => numbers.sort((a, b) => a - b).join('-');

  const onSubmit = async (amount: number, numbers: number[]) => {
    try {
      await play(amount, numbers);

      showModal({
        variant: 'success',
        title: 'Bræt blev købt',
        description: `Du har købt ${amount} bræt med numrene ${formatNumbers(numbers)}`,
      });

      return true;
    } catch (e) {
      showModal({
        variant: 'error',
        title: 'En fejl opstod',
        description: errorToMessage(e),
      });
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center pt-42">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!game) {
    return (
      <ErrorState
        title="Intet aktiv spil fundet"
        message="Vent venligst – næste spil starter snart."
      />
    );
  }

  return (
    <div className="flex justify-center">
      <Card className="max-w-3xl w-full border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm">
        <CardHeader className="flex flex-col text-center border-b border-primary/10">
          <div className="text-3xl font-bold">Døde Duer</div>
          <div className="text-sm">Uge {game.week}</div>
        </CardHeader>

        <GameForm isLoading={isSubmitLoading} onSubmit={onSubmit} />
      </Card>
    </div>
  );
}
