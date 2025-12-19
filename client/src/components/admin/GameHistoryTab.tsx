'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  Divider,
  Button,
} from '@heroui/react';
import { BsEye } from 'react-icons/bs';
import { useGame } from '../../hooks';
import type { GameExtendedDto } from '../../generated-ts-client';
import { useNavigate } from 'react-router-dom';

export default function GameHistoryTab() {
  const { getAll, isLoading } = useGame();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [totalCount, setTotalCount] = useState(0);
  const [games, setGames] = useState<GameExtendedDto[]>([]);

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    getAll(page, pageSize).then((res) => {
      setGames(res.items);
      setTotalCount(res.totalCount);
    });
  }, [page]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <Card className="border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm">
        <CardBody className="p-4 gap-2 overflow-visible">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-foreground">Spil-historik</div>
              <p className="text-xs text-muted-foreground">{totalCount} spil i alt</p>
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
                        total={totalPages}
                        onChange={setPage}
                        size="sm"
                      />
                    </div>
                  }
                >
                  <TableHeader>
                    <TableColumn>UGE</TableColumn>
                    <TableColumn>ÅR</TableColumn>
                    <TableColumn align="end">BRÆT KØBT</TableColumn>
                    <TableColumn align="end">VINDERE</TableColumn>
                    <TableColumn align="end">OMSÆTNING</TableColumn>
                    <TableColumn align="end">{''}</TableColumn>
                  </TableHeader>

                  <TableBody
                    isLoading={isLoading}
                    loadingContent={<Spinner label="Indlæser..." />}
                    emptyContent="Ingen spil fundet"
                  >
                    {games.map((game) => {
                      const isActive = game.winningNumbers?.length === 0;

                      return (
                        <TableRow key={game.id} className={!isActive ? 'opacity-80' : ''}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span>Uge {game.week}</span>
                              {isActive && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                  Aktiv
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>{game.year}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {game.totalPlays}
                          </TableCell>
                          <TableCell className="text-right font-semibold">{game.winners}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {game.totalPrizePool},-
                          </TableCell>

                          <TableCell>
                            <div className="flex justify-end">
                              <Button
                                isIconOnly
                                size="sm"
                                variant={'light'}
                                color={'default'}
                                onPress={() => navigate(`/admin/game/${game.id}`)}
                              >
                                <BsEye className="w-4 h-4" />
                              </Button>
                            </div>
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
                {games.map((game) => (
                  <Card key={game.id} className="border border-primary/10 bg-card/80">
                    <CardBody className="space-y-1">
                      <div className="font-semibold">
                        Uge {game.week} ({game.year})
                      </div>
                      <div className="text-sm text-muted-foreground">Bræt: {game.totalPlays}</div>
                      <div className="text-sm font-medium">
                        Omsætning: {game.totalPrizePool?.toLocaleString('da-DK')},-
                      </div>

                      <Button
                        size="sm"
                        variant="light"
                        className="mt-2"
                        onPress={() => {
                          navigate(`/admin/game/${game.id}`);
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
    </motion.div>
  );
}
