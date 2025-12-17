import {
  Button,
  Card,
  CardBody,
  Divider,
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
import type { UserGameBoardDto } from '../../generated-ts-client';
import { AnimatePresence, motion } from 'framer-motion';
import { BsEye, BsTrash } from 'react-icons/bs';
import UserboardHistoryDrawer from '../drawer/UserBoardHistoryDrawer';
import { useState } from 'react';

interface UserBoardsTableProps {
  boards: UserGameBoardDto[];
  page: number;
  total: number;
  isLoading: boolean;
  deactivatingId: string | null;
  deactivateBoard: (borad: UserGameBoardDto) => Promise<void>;
  setPage: (page: number) => void;
}

export default function UserBoardsTable({
  boards,
  page,
  total,
  setPage,
  deactivateBoard,
  deactivatingId,
  isLoading,
}: UserBoardsTableProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [activeBoard, setActiveBoard] = useState<string>('');

  const openHistory = (board: UserGameBoardDto) => {
    setActiveBoard(board.id);
    onOpenChange();
  };

  return (
    <>
      <div className="hidden md:block">
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Table
              aria-label="Games table"
              removeWrapper
              bottomContent={
                <div className="flex mb-2 w-full justify-center">
                  <Pagination showControls page={page} total={total} onChange={setPage} size="sm" />
                </div>
              }
            >
              <TableHeader>
                <TableColumn>NUMRE</TableColumn>
                <TableColumn align="end">SPILLET</TableColumn>
                <TableColumn align="end">PRIS PR. SPIL</TableColumn>
                <TableColumn align="end">OPRETTET</TableColumn>
                <TableColumn align="end">{''}</TableColumn>
              </TableHeader>

              <TableBody
                isLoading={isLoading}
                loadingContent={<Spinner label="Indlæser..." />}
                emptyContent="Ingen bræt fundet"
              >
                {boards.map((board) => {
                  return (
                    <TableRow key={board.id}>
                      <TableCell className="text-right font-semibold">
                        <div className="flex items-center gap-2 justify-start">
                          {/* Status dot */}
                          <span className="relative flex h-3 w-3">
                            {board.stoppedAt == null && (
                              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            )}
                            <span
                              className={`relative inline-flex rounded-full h-3 w-3 ${
                                board.stoppedAt === null ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                            />
                          </span>

                          {board.numbers?.length ? (
                            <div className="flex flex-wrap gap-1">
                              {board.numbers.map((num, index) => {
                                return (
                                  <span
                                    key={`${num}-${index}`}
                                    className={`h-6 w-6 bg-primary/10 text-primary border-primary/20 flex border items-center justify-center rounded-full text-xs font-medium`}
                                  >
                                    {num}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">–</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {board.playedCount}/{board.repeatCount} gange
                      </TableCell>
                      <TableCell className="text-right">{board.pricePerGame},-</TableCell>

                      <TableCell className="text-right">
                        {new Date(board.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {board.stoppedAt === null && (
                            <Button
                              isIconOnly
                              size="sm"
                              isLoading={deactivatingId === board.id}
                              variant={'bordered'}
                              color="danger"
                              className="border-1 bg-red-100 border-red-300 hover:bg-red-300"
                              onPress={() => deactivateBoard(board)}
                            >
                              <BsTrash className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            isIconOnly
                            size="sm"
                            isLoading={deactivatingId === board.id}
                            variant={'bordered'}
                            className="border-1 bg-neutral-100 border-neutral-300 hover:bg-neutral-300"
                            onPress={() => openHistory(board)}
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
            {boards.map((board) => (
              <Card key={board.id} className="border border-primary/10 bg-card/80">
                <CardBody className="space-y-2">
                  {board.numbers?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {board.numbers.map((num, index) => {
                        return (
                          <span
                            key={`${num}-${index}`}
                            className={`h-6 w-6 bg-primary/10 text-primary border-primary/20 flex border items-center justify-center rounded-full text-xs font-medium`}
                          >
                            {num}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">–</span>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Gentagelser tilbage: {board.repeatCount}
                  </div>
                  <div className="text-sm font-medium">Spillet antal: {board.playedCount}</div>
                  <Divider />
                  <div className="text-sm italic text-sm">
                    {' '}
                    {new Date(board.createdAt).toLocaleDateString()}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </AnimatePresence>

        <div className="flex justify-center pt-2">
          <Pagination showControls page={page} total={total} onChange={setPage} size="sm" />
        </div>
      </div>

      <UserboardHistoryDrawer onOpenChange={onOpenChange} isOpen={isOpen} boardId={activeBoard} />
    </>
  );
}
