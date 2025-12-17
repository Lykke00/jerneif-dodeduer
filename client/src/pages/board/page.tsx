import { useEffect, useState } from 'react';
import { useUserBoards } from '../../hooks';
import type { UserGameBoardDto } from '../../generated-ts-client';
import { motion } from 'framer-motion';
import UserBoardsTable from '../../components/userboards/UserBoardsTable';
import { addToast, Button, Card, CardBody, CardHeader, useDisclosure } from '@heroui/react';
import { UserBoardNewModal } from '../../components/modal/UserBoardNewModal';
import { useModal } from '../../contexts/ModalContext';
import { errorToMessage } from '../../helpers/errorToMessage';

export default function UserBoardPage() {
  const { getAll, isLoading, create, isCreateLoading } = useUserBoards();
  const { showModal } = useModal();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [reloadKey, setReloadKey] = useState(0);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [data, setData] = useState<UserGameBoardDto[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getAll(page, pageSize).then((res) => {
      setData(res.items);
      setTotal(res.totalCount);
    });
  }, [page, reloadKey]);

  const createBoard = async (numbers: number[], amount: number, repeat: number) => {
    try {
      const created = await create(numbers, amount, repeat);

      setData((prev) => [created, ...prev]);
      setReloadKey((k) => k + 1);
      setTotal((prev) => prev + 1);

      addToast({
        title: 'Bræt oprettet',
        description: 'Det nye autospil bræt blev oprettet!',
        color: 'success',
      });
    } catch (e) {
      onOpenChange();
      showModal({
        variant: 'error',
        title: 'En fejl opstod',
        description: errorToMessage(e),
      });
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="space-y-6">
        <Card className="border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm">
          <CardHeader className="border-b border-primary/10">
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="text-xl font-bold text-foreground">Fremtidige bræt</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Her kan du redigere fremtidige autospil
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-2">
            <div className="flex flex-row space-y-2">
              <Button onPress={() => onOpenChange()}>Tilføj nyt</Button>
            </div>
            <UserBoardsTable
              isLoading={isLoading}
              boards={data}
              page={page}
              setPage={setPage}
              total={totalPages}
            />
          </CardBody>
        </Card>
      </div>

      <UserBoardNewModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        createBoard={createBoard}
        loading={isCreateLoading}
      />
    </motion.div>
  );
}
