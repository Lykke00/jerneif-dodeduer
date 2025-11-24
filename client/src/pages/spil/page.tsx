import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  CheckboxGroup,
  Divider,
} from '@heroui/react';
import GamePickCard from '../../components/GamePickCard';
import { useState } from 'react';

export default function SpilPage() {
  const [groupSelected, setGroupSelected] = useState<string[]>([]);

  return (
    <div className="flex flex-col items-center justify-center w-full gap-2">
      <Card className="w-full border border-card">
        <CardHeader className="flex flex-col">
          <p className="text-xl font-semibold">Uge 48</p>
          <span className="text-neutral-600 text-sm hidden sm:block">
            Begynd at spille nedenfor
          </span>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
              <GamePickCard number={num.toString()} value={num.toString()} />
            ))}
          </div>
        </CardBody>
        <Divider />
        <CardFooter>
          <div className="flex flex-col justify-center items-center w-full gap-2">
            <Button size="lg" className="w-full shadow-sm bg-primary text-white border border-new">
              Indsend
            </Button>
            <Checkbox>Gentag hver uge</Checkbox>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
