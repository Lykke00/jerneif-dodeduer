import { useEffect, useState } from 'react';
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
} from '@heroui/react';
import NumberListInput from '../common/NumberListInput';
import { useGame } from '../../hooks';

interface Winner {
  id: string;
  username: string;
  winnings: number;
}

interface GameState {
  status: 'running' | 'stopped';
  currentWeek: number;
  startDate: Date | null;
}

export default function GameTab() {
  const { game, getCurrent } = useGame();

  useEffect(() => {
    getCurrent();
  }, []);

  const [gameState, setGameState] = useState<GameState>({
    status: 'stopped',
    currentWeek: 0,
    startDate: null,
  });

  const [weekNumber, setWeekNumber] = useState('');
  const [winners, setWinners] = useState<Winner[]>([
    { id: '1', username: 'user_001', winnings: 5000 },
    { id: '2', username: 'user_002', winnings: 3500 },
    { id: '3', username: 'user_003', winnings: 2000 },
  ]);

  const handleStartGame = () => {
    if (!weekNumber) return;
    setGameState({
      status: 'running',
      currentWeek: Number.parseInt(weekNumber),
      startDate: new Date(),
    });
    setWeekNumber('');
  };

  const handleStopGame = () => {
    setGameState({
      ...gameState,
      status: 'stopped',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      {game !== null ? (
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
            <CardBody className="pt-6 flex flex-col gap-2">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Startet den {new Date(game.createdAt).toLocaleString()}
                </p>
              </div>
              <NumberListInput />
              <Button
                onPress={handleStopGame}
                className="w-full h-11 font-semibold text-base bg-red-600 hover:bg-red-700 text-white transition-all"
              >
                Stop spil
              </Button>
            </CardBody>
          </Card>
        </>
      ) : (
        <>
          <Card className="border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm">
            <CardHeader className="border-b border-primary/10">
              <div>
                <div className="text-xl font-bold text-foreground">Start et nyt spil</div>
                <p className="text-sm text-muted-foreground mt-1">Opret en ny spil uge</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4 pt-4">
              <div>
                <Input
                  type="number"
                  label="Uge nummer"
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(e.target.value)}
                  placeholder="43"
                  min="1"
                />
              </div>
              <Button
                onPress={handleStartGame}
                disabled={!weekNumber}
                className="w-full h-11 font-semibold text-base bg-gradient-to-r from-primary to-primary/80 transition-all text-white"
              >
                Start spil
              </Button>
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
      )}
    </motion.div>
  );
}
