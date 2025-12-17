import { Input } from '@heroui/react';
import { useState } from 'react';

interface NumberListInputProps {
  value: number[];
  onChange: (numbers: number[]) => void;
}

export default function NumberListInput({ value, onChange }: NumberListInputProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleChange = (val: string) => {
    // kun tillad tal og -
    if (!/^[0-9-]*$/.test(val)) return;

    // ikke tillad flere - efter hinanden
    if (val.includes('--')) return;

    // tillad ikke at det starter med -
    if (val.startsWith('-')) return;

    // tillad ikke mere end to bindestreger ved 3 tal
    const hyphenCount = (val.match(/-/g) || []).length;
    if (hyphenCount > 2) return;

    // tjek hver del - skal være numre mellem 1-16 eller tomme (skriver stadig)
    const parts = val.split('-');
    for (const part of parts) {
      if (part !== '') {
        const num = parseInt(part, 10);
        if (num < 1 || num > 16) return; // bloker ugyldige numre med det samme
      }
    }

    setText(val);

    // parse tal
    const numbers = parts.map((p) => parseInt(p, 10)).filter((n) => !isNaN(n));

    // validering
    if (val === '') {
      setError('');
      onChange([]);
      return;
    }

    // tjek om der stadig bliver skrevet (incomplete input)
    if (parts.length < 3 || parts.some((p) => p === '')) {
      setError('Format skal være: tal-tal-tal (fx 1-4-10)');
      onChange([]);
      return;
    }

    // skal være præcist 3 tal
    if (numbers.length !== 3) {
      setError('Der skal indtastes præcis 3 tal');
      onChange([]);
      return;
    }

    // tal skal være mellem 1-16
    if (numbers.some((n) => n < 1 || n > 16)) {
      setError('Tal skal være mellem 1 og 16');
      onChange([]);
      return;
    }

    // ingen duplikater
    if (numbers.length !== new Set(numbers).size) {
      setError('Tal må ikke gentages');
      onChange([]);
      return;
    }

    // alle er ok
    setError('');
    onChange(numbers);
  };

  return (
    <Input
      label="Tal (1–16)"
      placeholder="1-2-3"
      value={text}
      onValueChange={handleChange}
      errorMessage={error}
      isInvalid={!!error}
      description="Indtast 3 unikke tal mellem 1–16, adskilt af '-'"
    />
  );
}
