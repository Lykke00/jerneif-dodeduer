import { useEffect, useState } from 'react';
import { useUserBoards } from '../../hooks';
import type { UserGameBoardDto } from '../../generated-ts-client';
import { motion } from 'framer-motion';
import UserBoardsTable from '../../components/userboards/UserBoardsTable';
import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Select,
  SelectItem,
  useDisclosure,
} from '@heroui/react';
import { UserBoardNewModal } from '../../components/modal/UserBoardNewModal';
import { useModal } from '../../contexts/ModalContext';
import { errorToMessage } from '../../helpers/errorToMessage';

export default function UserBoardPage() {
  const { getAll, isLoading, create, deactivate, isDeactivateLoading, isCreateLoading } =
    useUserBoards();
  const { showModal } = useModal();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [reloadKey, setReloadKey] = useState(0);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [data, setData] = useState<UserGameBoardDto[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getAll(activeFilter, page, pageSize).then((res) => {
      setData(res.items);
      setTotal(res.totalCount);
    });
  }, [page, reloadKey, activeFilter]);

  const deactivateBoard = async (board: UserGameBoardDto) => {
    try {
      setDeactivatingId(board.id);

      await deactivate(board.id);
      setReloadKey((k) => k + 1);

      addToast({
        title: 'Bræt deaktiveret',
        description: 'Brættet blev deaktiveret!',
        color: 'success',
      });
    } catch (e) {
      showModal({
        variant: 'error',
        title: 'En fejl opstod',
        description: errorToMessage(e),
      });
    } finally {
      setDeactivatingId(null);
    }
  };

  const createBoard = async (numbers: number[], amount: number, repeat: number) => {
    try {
      await create(numbers, amount, repeat);

      setReloadKey((k) => k + 1);

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

  const handleFilterChange = (value: string) => {
    if (value === 'all') {
      setActiveFilter(null);
    } else if (value === 'active') {
      setActiveFilter(true);
    } else if (value === 'inactive') {
      setActiveFilter(false);
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
            <div className="flex flex-row items-center justify-between gap-4">
              <Select
                label="Filtrer bræt"
                placeholder="Vælg filter"
                selectedKeys={[
                  activeFilter === null ? 'all' : activeFilter ? 'active' : 'inactive',
                ]}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="max-w-xs"
                size="sm"
              >
                <SelectItem key="all">Alle bræt</SelectItem>
                <SelectItem key="active">Aktive bræt</SelectItem>
                <SelectItem key="inactive">Inaktive bræt</SelectItem>
              </Select>

              <Button onPress={() => onOpenChange()}>Tilføj nyt</Button>
            </div>

            <UserBoardsTable
              isLoading={isLoading}
              boards={data}
              page={page}
              setPage={setPage}
              deactivateBoard={deactivateBoard}
              deactivatingId={deactivatingId}
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
