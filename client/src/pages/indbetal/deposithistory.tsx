import { useEffect, useState } from 'react';
import { useDeposit } from '../../hooks';
import type { GetDepositsResponse } from '../../generated-ts-client';
import DepositHistory from '../../components/deposit/DepositHistory';
import { Pagination } from '@heroui/react';

export default function DepositHistoryPage() {
  const { getAll } = useDeposit();
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [data, setData] = useState<GetDepositsResponse[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getAll(page, pageSize).then((res) => {
      setData(res.items);
      setTotal(res.totalCount);
    });
  }, [page]);

  return (
    <div className="space-y-6">
      <DepositHistory submissions={data} totalCount={total} />

      {total > 0 && (
        <Pagination
          total={Math.ceil(total / pageSize)}
          page={page}
          onChange={setPage}
          showControls
          color="primary"
        />
      )}
    </div>
  );
}
