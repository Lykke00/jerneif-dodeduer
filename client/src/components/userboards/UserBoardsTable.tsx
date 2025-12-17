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
} from '@heroui/react';
import type { UserGameBoardDto } from '../../generated-ts-client';
import { AnimatePresence, motion } from 'framer-motion';
import { BsEye } from 'react-icons/bs';

interface UserBoardsTableProps {
  boards: UserGameBoardDto[];
  page: number;
  total: number;
  isLoading: boolean;
  setPage: (page: number) => void;
}

export default function UserBoardsTable({
  boards,
  page,
  total,
  setPage,
  isLoading,
}: UserBoardsTableProps) {
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
                      </TableCell>

                      <TableCell>
                        {board.playedCount}/{board.repeatCount} gange
                      </TableCell>
                      <TableCell className="text-right">{board.pricePerGame},-</TableCell>

                      <TableCell className="text-right">
                        {new Date(board.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            isIconOnly
                            size="sm"
                            variant={'light'}
                            color={'default'}
                            onPress={() => console.log('xd')}
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
    </>
  );
}
