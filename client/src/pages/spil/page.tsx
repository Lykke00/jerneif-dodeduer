import { Button, CheckboxGroup, Divider } from '@heroui/react';
import GamePickCard from '../../components/GamePickCard';
import { useState } from 'react';

export default function SpilPage() {
  const [groupSelected, setGroupSelected] = useState<string[]>([]);

  return (
    <div className="flex flex-col items-center justify-center w-full gap-2">
      <div className="grid grid-cols-4 gap-2 w-full">
        {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
          <GamePickCard number={num.toString()} value={num.toString()} />
        ))}
      </div>
      <Divider />
      <div className="flex flex-col w-full">
        <Button size="lg" className="w-full" variant="solid">
          Indsend
        </Button>
      </div>
    </div>
  );
}
