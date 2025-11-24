import { Button } from '@heroui/react';
import { useState } from 'react';

interface GamePickCardProps {
  number: string;
  value: string;
}

export default function GamePickCard({ number, value }: GamePickCardProps) {
  const [isChecked, setIsChecked] = useState<boolean>(false);

  return (
    <Button
      className={`w-auto h-30 ${isChecked && 'bg-secondary border-secondary'}`}
      onPress={() => setIsChecked(!isChecked)}
    >
      {value}
    </Button>
  );
}
