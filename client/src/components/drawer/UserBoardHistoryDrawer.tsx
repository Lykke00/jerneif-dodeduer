import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Divider,
} from '@heroui/react';
import type { UserGameBoardHistoryDto } from '../../generated-ts-client';
import { useUserBoards } from '../../hooks';
import { useEffect, useState } from 'react';

interface UserboardHistoryDrawerProps {
  isOpen: boolean;
  boardId: string | null;
  onOpenChange: () => void;
}

export default function UserboardHistoryDrawer({
  isOpen,
  onOpenChange,
  boardId,
}: UserboardHistoryDrawerProps) {
  const { history } = useUserBoards();

  const [data, setData] = useState<UserGameBoardHistoryDto[]>([]);

  useEffect(() => {
    if (isOpen && boardId) {
      history(boardId).then(setData);
    }
  }, [isOpen, boardId]);

  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange} size="md">
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="space-y-1 flex flex-col gap-0">
              <div className="text-lg font-semibold">Spilhistorik</div>
              <div className="text-sm text-neutral-800">Vindertal og resultater pr. uge</div>
            </DrawerHeader>

            <Divider />

            <DrawerBody>
              {data.length === 0 && (
                <div className="text-sm text-muted-foreground italic">Ingen historik fundet</div>
              )}

              {data.map((play, index) => {
                const winningNumberSet = new Set(play.winningNumbers);
                const playerNumberSet = new Set(play.numbers);

                const hasAllWinningNumbers = play.winningNumbers.every((num) =>
                  playerNumberSet.has(num)
                );

                return (
                  <div
                    key={index}
                    className={`rounded-lg border bg-card/80 p-4 space-y-3 ${
                      play.isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        Uge {play.gameWeek}, {play.year}
                      </div>
                      <div className="text-sm font-semibold text-primary">{play.price},-</div>
                    </div>

                    {/* Numbers */}
                    <div className="flex flex-wrap gap-1">
                      {play.numbers.map((num, i) => {
                        const isWinning = hasAllWinningNumbers && winningNumberSet.has(num);

                        return (
                          <span
                            key={`${num}-${i}`}
                            className={`h-7 w-7 flex items-center justify-center
                rounded-full border text-sm font-medium
                ${
                  isWinning
                    ? 'bg-success/20 text-green-900 border-success/30'
                    : 'border-primary/20 bg-primary/10 text-primary'
                }`}
                          >
                            {num}
                          </span>
                        );
                      })}
                    </div>

                    {/* Message */}
                    {play.message && (
                      <div
                        className={`text-xs ${
                          play.isSuccess ? 'text-green-600' : 'text-muted-foreground'
                        }`}
                      >
                        {play.message}
                      </div>
                    )}
                  </div>
                );
              })}
            </DrawerBody>

            <DrawerFooter className="flex justify-end">
              <Button variant="light" onPress={onClose}>
                Luk
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
