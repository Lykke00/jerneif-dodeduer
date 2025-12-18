import { addToast, Card, CardHeader, Spinner } from '@heroui/react';
import { useEffect, useState } from 'react';
import { useGame, useUserBoards } from '../../hooks';
import ErrorState from '../../components/common/ErrorState';
import GameForm from '../../components/game/GameForm';
import { useModal } from '../../contexts/ModalContext';
import { errorToMessage } from '../../helpers/errorToMessage';
import { motion } from 'framer-motion';

export default function DeadPigeonsGame() {
  const { game, isLoading, isSubmitLoading, getCurrent, play } = useGame();
  const { create } = useUserBoards();
  const { showModal } = useModal();
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [repeatCount, setRepeatCount] = useState(1);

  useEffect(() => {
    getCurrent();
  }, []);

  const formatNumbers = (numbers: number[]) => numbers.sort((a, b) => a - b).join('-');

  const onSubmit = async ({
    amount,
    numbers,
    autoBuyEnabled,
    repeatCount,
  }: {
    amount: number;
    numbers: number[];
    autoBuyEnabled: boolean;
    repeatCount: number;
  }): Promise<boolean> => {
    try {
      await play(amount, numbers);

      if (autoBuyEnabled && repeatCount) {
        await create(numbers, repeatCount);
      }

      const title = autoBuyEnabled ? 'Bræt købt og auto-køb oprettet' : 'Bræt blev købt';

      const description = autoBuyEnabled
        ? `Du har købt ${amount} bræt med numrene ${formatNumbers(
            numbers
          )}. Brættet bliver automatisk købt hver uge i ${repeatCount} uger.`
        : `Du har købt ${amount} bræt med numrene ${formatNumbers(numbers)}.`;

      showModal({
        variant: 'success',
        title,
        description,
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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto justify-center flex"
    >
      <Card className="max-w-3xl w-full border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm">
        <CardHeader className="flex flex-col text-center border-b border-primary/10">
          <div className="text-3xl font-bold">Døde Duer</div>
          <div className="text-sm">Uge {game.week}</div>
        </CardHeader>

        <GameForm isLoading={isSubmitLoading} onSubmit={onSubmit} />
      </Card>
    </motion.div>
  );
}
