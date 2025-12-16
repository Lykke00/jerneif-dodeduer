import { Input } from '@heroui/react';
import { useEffect, useState } from 'react';

interface NumberListInputProps {
  value: number[];
  onChange: (numbers: number[]) => void;
}

export default function NumberListInput({ value, onChange }: NumberListInputProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  // Parse string → number[]
  const parse = (val: string): number[] =>
    val
      .split('-')
      .map((p) => parseInt(p, 10))
      .filter((n) => !isNaN(n));

  // Validate parsed numbers
  const validate = (numbers: number[]) => {
    if (numbers.length === 0) {
      setError('');
      return;
    }

    if (numbers.length < 1) {
      setError('Minimum 1 tal påkrævet');
      return;
    }

    if (numbers.some((n) => n < 1 || n > 16)) {
      setError('Tal skal være mellem 1 og 16');
      return;
    }

    if (numbers.length !== new Set(numbers).size) {
      setError('Tal må ikke gentages');
      return;
    }

    setError('');
  };

  const handleChange = (val: string) => {
    // Tillad kun cifre og bindestreger
    if (!/^[0-9-]*$/.test(val)) return;

    setText(val);

    const numbers = parse(val);
    onChange(numbers);
    validate(numbers);
  };

  return (
    <Input
      label="Tal (1–16)"
      placeholder="1-2-3-4-5"
      value={text}
      onValueChange={handleChange}
      errorMessage={error}
      isInvalid={!!error}
      description="Indtast unikke tal mellem 1–16, adskilt af '-'"
    />
  );
}
