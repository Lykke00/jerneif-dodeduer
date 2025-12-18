import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '@heroui/react';
import type { UserWinnerDto } from '../../generated-ts-client';

interface UserInfoDrawerProps {
  isOpen: boolean;
  onOpenChange: () => void;
  user: UserWinnerDto | undefined;
  winningNumbers: number[] | undefined;
  numbers: number[][];
}

export default function WinningNumbersDrawer({
  numbers,
  user,
  isOpen,
  winningNumbers,
  onOpenChange,
}: UserInfoDrawerProps) {
  const winningNumberSet = new Set(winningNumbers ?? []);

  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="flex flex-col gap-1">
              Vindertal for {user?.fullName}
            </DrawerHeader>
            <DrawerBody className="flex flex-col gap-4">
              {numbers.map((play, playIndex) => (
                <div key={playIndex} className="flex flex-col gap-1">
                  <div className="text-sm font-semibold">Bræt {playIndex + 1}</div>

                  <div className="flex flex-wrap gap-1">
                    {play.map((num, index) => {
                      const isWinning = winningNumberSet.has(num);

                      return (
                        <span
                          key={`${num}-${index}`}
                          className={`h-7 w-7 flex items-center justify-center rounded-full border text-sm font-medium
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
                </div>
              ))}
            </DrawerBody>
            <DrawerFooter>
              <Button color="primary" onPress={onClose}>
                Luk
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
