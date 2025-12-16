import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  NumberInput,
  Form,
} from '@heroui/react';
import NumberListInput from '../common/NumberListInput';
import { useGame } from '../../hooks';
import { errorToMessage } from '../../helpers/errorToMessage';
import { useModal } from '../../contexts/ModalContext';

interface Winner {
  id: string;
  username: string;
  winnings: number;
}

export default function GameTab() {
  const { game, getCurrent, isUpdateLoading, isCreateLoading, updateGame, createGame } = useGame();
  const { showModal } = useModal();

  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
  const [weekNumber, setWeekNumber] = useState<number>();

  useEffect(() => {
    getCurrent();
  }, []);

  const update = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(winningNumbers);
    try {
      if (winningNumbers.length === 0) {
        throw new Error('Der skal være et vindertal');
      }

      await updateGame(winningNumbers);
      setWinningNumbers([]);
    } catch (e) {
      showModal({
        variant: 'error',
        title: 'En fejl opstod',
        description: errorToMessage(e),
      });
    }
  };

  const create = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (weekNumber == undefined || weekNumber == 0) {
        throw new Error('Uge nummer skal være højere end nul');
      }

      await createGame(weekNumber);
      setWeekNumber(undefined);
      // opdater state her hvis relevant
    } catch (e) {
      showModal({
        variant: 'error',
        title: 'En fejl opstod',
        description: errorToMessage(e),
      });
    }
  };

  const [winners, setWinners] = useState<Winner[]>([
    { id: '1', username: 'user_001', winnings: 5000 },
    { id: '2', username: 'user_002', winnings: 3500 },
    { id: '3', username: 'user_003', winnings: 2000 },
  ]);

  const hasGame = game !== null;
  const hasWinningNumbers = (game?.winningNumbers?.length ?? 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      {hasGame && !hasWinningNumbers ? (
        // Game is running - show form to enter winning numbers
        <>
          <Card className="border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm">
            <CardHeader className="border-b border-primary/10">
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="text-xl font-bold text-foreground">Spil kørende</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Uge {game.week} er i øjeblikket aktiv
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-green-500">Aktiv</span>
                </div>
              </div>
            </CardHeader>
            <Form onSubmit={update}>
              <CardBody className="pt-6 flex flex-col gap-2">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Startet den {new Date(game.createdAt).toLocaleString()}
                  </p>
                </div>
                <NumberListInput value={winningNumbers} onChange={setWinningNumbers} />
                <Button
                  name="submit"
                  type="submit"
                  isLoading={isUpdateLoading}
                  className="w-full h-11 font-semibold text-base bg-red-600 hover:bg-red-700 text-white transition-all"
                >
                  Stop spil
                </Button>
              </CardBody>
            </Form>
          </Card>
        </>
      ) : hasWinningNumbers ? (
        // Game has winning numbers - show start new game + winners
        <>
          <Card className="border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm">
            <CardHeader className="border-b border-primary/10">
              <div>
                <div className="text-xl font-bold text-foreground">Start et nyt spil</div>
                <p className="text-sm text-muted-foreground mt-1">Opret en ny spil uge</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4 pt-4">
              <Form onSubmit={create} className="w-full">
                <NumberInput
                  isDisabled={isCreateLoading}
                  name="weekNumber"
                  type="number"
                  label="Uge nummer"
                  value={weekNumber}
                  onValueChange={setWeekNumber}
                  placeholder="43"
                  min="1"
                />
                <Button
                  isLoading={isCreateLoading}
                  type="submit"
                  name="submit"
                  disabled={!weekNumber}
                  className="w-full h-11 font-semibold text-base bg-gradient-to-r from-primary to-primary/80 transition-all text-white"
                >
                  Start spil
                </Button>
              </Form>
            </CardBody>
          </Card>

          <Card className="border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm">
            <CardHeader className="border-b border-primary/10">
              <div>
                <div className="text-lg font-bold text-foreground">Seneste vindere</div>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {winners.length} vinder{winners.length !== 1 ? 'e' : ''}
                </p>
              </div>
            </CardHeader>
            <CardBody className="p-2">
              <AnimatePresence>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Table aria-label="Winners table" removeWrapper>
                    <TableHeader>
                      <TableColumn>EMAIL</TableColumn>
                      <TableColumn align="end">GEVINSTER</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {winners.map((winner) => (
                        <TableRow key={winner.id}>
                          <TableCell>{winner.username}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {winner.winnings.toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'DKK',
                              minimumFractionDigits: 0,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </motion.div>
              </AnimatePresence>
            </CardBody>
          </Card>
        </>
      ) : (
        // No game - show start new game only
        <>
          <Card className="border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm">
            <CardHeader className="border-b border-primary/10">
              <div>
                <div className="text-xl font-bold text-foreground">Start et nyt spil</div>
                <p className="text-sm text-muted-foreground mt-1">Opret en ny spil uge</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4 pt-4">
              <Form onSubmit={create} className="w-full">
                <NumberInput
                  isDisabled={isCreateLoading}
                  name="weekNumber"
                  type="number"
                  label="Uge nummer"
                  value={weekNumber}
                  onValueChange={setWeekNumber}
                  placeholder="43"
                  min="1"
                />
                <Button
                  name="weekNumber"
                  type="submit"
                  isLoading={isCreateLoading}
                  disabled={!weekNumber}
                  className="w-full h-11 font-semibold text-base bg-gradient-to-r from-primary to-primary/80 transition-all text-white"
                >
                  Start spil
                </Button>
              </Form>
            </CardBody>
          </Card>
        </>
      )}
    </motion.div>
  );
}
