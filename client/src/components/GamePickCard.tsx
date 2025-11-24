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
      onPress={() => setIsChecked(!isChecked)}
      className={`
        relative w-auto h-20 overflow-hidden
        ${
          isChecked
            ? 'bg-primary border border-new text-white'
            : `bg-secondary [&[data-hover='true']]:bg-secondary-hover`
        }
      `}
    >
      <span
        className="
          inline-block transition-transform duration-200
          group-hover:-translate-y-1
        "
      >
        {value}
      </span>
    </Button>
  );
}
