import { useParams } from 'react-router-dom';
import { useGame } from '../../hooks';
import { useModal } from '../../contexts/ModalContext';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import ErrorState from '../common/ErrorState';
import { useEffect, useState } from 'react';
import type { PagedResultOfGameExtendedDto, UserWinnerDto } from '../../generated-ts-client';
import { AnimatePresence, motion } from 'framer-motion';
import { BsEye } from 'react-icons/bs';

export default function GameSpecificTab() {
  const { gameId } = useParams<{ gameId: string }>();

  const [page, setPage] = useState(1);
  const { getGameWinners, isLoading, isSubmitLoading, play } = useGame();
  const { showModal } = useModal();

  const [gameWinners, setGameWinners] = useState<UserWinnerDto[]>([]);
  const [totalGameWinners, setTotalGameWinners] = useState<number>(0);

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        if (gameId == null) {
          showModal({
            variant: 'error',
            title: 'En fejl opstod',
            description: 'Kunne ikke hente spil-historik',
          });
          return;
        }

        const res = await getGameWinners(gameId, 1, 10);
        if (!isActive) return;

        setGameWinners(res.items);
        setTotalGameWinners(res.totalCount);
      } catch {
        showModal({
          variant: 'error',
          title: 'En fejl opstod',
          description: 'Kunne ikke hente spil-historik',
        });
      }
    })();

    return () => {
      isActive = false;
    };
  }, [gameId, page]);

  if (isLoading) {
    return (
      <div className="flex justify-center pt-42">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Card className="border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm w-full">
        <CardBody className="p-4 gap-2 overflow-visible">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-foreground">Vindere</div>
              <p className="text-xs text-muted-foreground">{totalGameWinners} vindere i alt</p>
            </div>
          </div>

          <Divider />

          {/* DESKTOP TABLE */}
          <div className="hidden md:block">
            <AnimatePresence>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Table
                  aria-label="Games table"
                  removeWrapper
                  bottomContent={
                    <div className="flex mb-2 w-full justify-center">
                      <Pagination
                        showControls
                        page={page}
                        total={totalGameWinners}
                        onChange={setPage}
                        size="sm"
                      />
                    </div>
                  }
                >
                  <TableHeader>
                    <TableColumn>Navn</TableColumn>
                    <TableColumn>Total spil</TableColumn>
                    <TableColumn>Vinder tal</TableColumn>
                  </TableHeader>

                  <TableBody
                    isLoading={isLoading}
                    loadingContent={<Spinner label="Indlæser..." />}
                    emptyContent="Ingen spil fundet"
                  >
                    {gameWinners.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell className="font-medium">{user.winningPlays}</TableCell>
                        <TableCell className="font-medium">{user.winningPlays}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* MOBILE LIST */}
          <div className="block md:hidden space-y-3">
            <AnimatePresence>
              <div className="space-y-3">
                {gameWinners.map((game) => (
                  <Card key={game.id} className="border border-primary/10 bg-card/80">
                    <CardBody className="space-y-1">
                      <div className="font-semibold"></div>
                      <div className="text-sm font-medium"></div>

                      <Button
                        size="sm"
                        variant="light"
                        className="mt-2"
                        onPress={() => {
                          // navigate(`/games/${game.id}`)
                        }}
                      >
                        Se spil
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </AnimatePresence>

            <div className="flex justify-center pt-2">
              <Pagination
                showControls
                page={page}
                total={totalGameWinners}
                onChange={setPage}
                size="sm"
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
