import { useParams } from 'react-router-dom';
import { useGame } from '../../hooks';
import { useModal } from '../../contexts/ModalContext';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from '@heroui/react';
import { useEffect, useState } from 'react';
import { type GameExtendedDto, type UserWinnerDto } from '../../generated-ts-client';
import { AnimatePresence, motion } from 'framer-motion';
import WinningNumbersDrawer from '../drawer/WinningNumbersDrawer';
import { BsArrowDown } from 'react-icons/bs';
import { exportCsv } from '../../helpers/export/exportCsv';
import { exportXlsx } from '../../helpers/export/exportXlsx';
import { exportPdf } from '../../helpers/export/exportPdf';
import { exportDocx } from '../../helpers/export/exportDocx';
import { mapToExportModel } from '../../types/WinnersExportModel';

export default function GameSpecificTab() {
  const { gameId } = useParams<{ gameId: string }>();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<UserWinnerDto | undefined>();
  const [selectedNumbers, setSelectedNumbers] = useState<number[][]>([]);

  const [page, setPage] = useState(1);
  const { getGameWinners, getGameInfo, isLoading } = useGame();
  const { showModal } = useModal();

  const [game, setCurrentGame] = useState<GameExtendedDto>();
  const [gameWinners, setGameWinners] = useState<UserWinnerDto[]>([]);
  const [totalGameWinners, setTotalGameWinners] = useState<number>(0);
  const pageSize = 10;
  const totalPages = Math.ceil(totalGameWinners / pageSize);

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        if (gameId == null) {
          showModal({
            variant: 'error',
            title: 'En fejl opstod',
            description: 'Kunne ikke hente spil-info',
          });
          return;
        }

        const gameInfo = await getGameInfo(gameId);
        if (!isActive) return;

        setCurrentGame(gameInfo);
      } catch {
        showModal({
          variant: 'error',
          title: 'En fejl opstod',
          description: 'Kunne ikke hente spil-info',
        });
      }
    })();

    return () => {
      isActive = false;
    };
  }, [gameId]);

  const winningNumberSet = new Set(game?.winningNumbers ?? []);

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

        const res = await getGameWinners(gameId, page, pageSize);
        if (!isActive) return;

        console.log(res);
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

  const exportModel = game && gameWinners.length ? mapToExportModel(game, gameWinners) : null;

  return (
    <div className="flex justify-center flex flex-col gap-2">
      <Card className="border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm w-full">
        <CardBody className="p-4 gap-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-bold text-foreground">
                Uge {game?.week} – {game?.year}
              </div>
              <p className="text-xs text-muted-foreground">{game?.totalPlays} bræt købt</p>
              <p className="text-xs text-muted-foreground">{game?.totalPrizePool},- brugt ialt</p>
            </div>

            {game?.createdAt && (
              <span className="text-xs text-muted-foreground">
                Oprettet {new Date(game.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <Divider />

          {/* Winning numbers */}
          {game?.winningNumbers?.length ? (
            <div className="flex flex-wrap gap-2">
              {game.winningNumbers.map((num) => (
                <div
                  key={num}
                  className="h-8 w-8 flex items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium"
                >
                  {num}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Ingen vinder-tal registreret</p>
          )}
        </CardBody>
      </Card>
      <Card className="border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm w-full">
        <CardBody className="p-4 gap-2 overflow-visible">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-foreground">Vindere</div>
              <p className="text-xs text-muted-foreground">{totalGameWinners} vindere i alt</p>
            </div>

            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" className="border-primary/15 hover:bg-primary/15">
                  Eksporter
                  <BsArrowDown />
                </Button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Eksportér vindere">
                <DropdownItem key="csv" onPress={() => exportModel && exportCsv(exportModel)}>
                  <div className="flex w-full justify-between items-center">
                    <span>CSV</span>
                    <span className="text-xs text-muted-foreground">(.csv)</span>
                  </div>
                </DropdownItem>

                <DropdownItem key="xlsx" onPress={() => exportModel && exportXlsx(exportModel)}>
                  <div className="flex w-full justify-between items-center">
                    <span>Excel</span>
                    <span className="text-xs text-muted-foreground">(.xlsx)</span>
                  </div>
                </DropdownItem>

                <DropdownItem key="pdf" onPress={() => exportModel && exportPdf(exportModel)}>
                  <div className="flex w-full justify-between items-center">
                    <span>PDF</span>
                    <span className="text-xs text-muted-foreground">(.pdf)</span>
                  </div>
                </DropdownItem>

                <DropdownItem key="docx" onPress={() => exportModel && exportDocx(exportModel)}>
                  <div className="flex w-full justify-between items-center">
                    <span>Word</span>
                    <span className="text-xs text-muted-foreground">(.docx)</span>
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
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
                        total={totalPages}
                        onChange={setPage}
                        size="sm"
                      />
                    </div>
                  }
                >
                  <TableHeader>
                    <TableColumn>Navn</TableColumn>
                    <TableColumn>Total spil</TableColumn>
                    <TableColumn>Kostet</TableColumn>
                    <TableColumn>Vinder tal</TableColumn>
                  </TableHeader>

                  <TableBody
                    isLoading={isLoading}
                    loadingContent={<Spinner label="Indlæser..." />}
                    emptyContent="Ingen spil fundet"
                  >
                    {gameWinners.map((user) => {
                      const playedNumbers = user.playedNumbers ?? [];
                      const firstPlay = playedNumbers[0];

                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell className="font-medium">{user.winningPlays}</TableCell>
                          <TableCell className="font-medium">{user.totalSpent},-</TableCell>

                          <TableCell className="flex flex-row gap-2">
                            {firstPlay?.length ? (
                              <div className="flex flex-wrap gap-1">
                                {firstPlay.map((num, index) => {
                                  const isWinning = winningNumberSet.has(num);

                                  return (
                                    <span
                                      key={`${num}-${index}`}
                                      className={`h-6 w-6 flex border items-center justify-center rounded-full text-xs font-medium
                                        ${
                                          isWinning
                                            ? 'bg-success/20 text-green-900 border-success/30'
                                            : 'bg-primary/10 text-primary border-primary/20'
                                        }`}
                                    >
                                      {num}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">–</span>
                            )}

                            {user.playedNumbers?.length && user.playedNumbers.length > 1 && (
                              <button
                                className="hover:underline cursor-pointer"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setSelectedNumbers(user.playedNumbers ?? []);
                                  onOpen();
                                }}
                              >
                                +{playedNumbers.length - 1} flere
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                total={totalPages}
                onChange={setPage}
                size="sm"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <WinningNumbersDrawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        winningNumbers={game?.winningNumbers}
        user={selectedUser}
        numbers={selectedNumbers}
      />
    </div>
  );
}
