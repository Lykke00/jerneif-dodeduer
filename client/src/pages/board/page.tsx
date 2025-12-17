import { useEffect, useState } from 'react';
import { useUserBoards } from '../../hooks';
import type { UserGameBoardDto } from '../../generated-ts-client';
import { motion } from 'framer-motion';
import UserBoardsTable from '../../components/userboards/UserBoardsTable';
import { Button, Card, CardBody, CardHeader } from '@heroui/react';

export default function UserBoardPage() {
  const { getAll } = useUserBoards();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [data, setData] = useState<UserGameBoardDto[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getAll(page, pageSize).then((res) => {
      setData(res.items);
      setTotal(res.totalCount);
    });
  }, [page]);

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
              <Button>Tilføj nyt</Button>
            </div>
            <UserBoardsTable boards={data} page={page} setPage={setPage} total={totalPages} />
          </CardBody>
        </Card>
      </div>
    </motion.div>
  );
}
