import { Input } from '@heroui/react';
import { useState } from 'react';

export default function StrictNumberInput() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleChange = (next: string) => {
    // Allow deletion
    if (next.length < value.length) {
      setValue(next);
      validateComplete(next);
      return;
    }

    // Only digits and "-"
    if (!/^[0-9-]*$/.test(next)) return;

    // Can't start with "-"
    if (next.startsWith('-')) return;

    // Don't allow multiple consecutive hyphens
    if (next.includes('--')) return;

    // Split by "-" and check the last segment being typed
    const parts = next.split('-');
    const last = parts[parts.length - 1];

    // Check max 8 numbers
    const completedNumbers = parts.slice(0, -1).filter((p) => p !== '');
    if (completedNumbers.length >= 8) {
      // Don't allow more numbers after 8 complete ones
      if (last === '') return;
    }

    // If last part is empty (user typed "-" manually), only allow if previous part has a number
    if (last === '') {
      // Don't allow "-" if the previous character is already "-"
      if (value.endsWith('-')) return;
      setValue(next);
      validateComplete(next);
      return;
    }

    // Validate each complete segment (all except possibly the last)
    const completedNums: number[] = [];
    for (let i = 0; i < parts.length - 1; i++) {
      const num = parseInt(parts[i]);
      if (isNaN(num) || num < 1 || num > 16) return;
      completedNums.push(num);
    }

    // Check for duplicates in completed numbers
    const hasDuplicates = completedNums.length !== new Set(completedNums).size;
    if (hasDuplicates) return;

    // Check if current number would be a duplicate
    const lastNum = parseInt(last);
    if (!isNaN(lastNum) && completedNums.includes(lastNum)) {
      // Don't allow duplicate numbers
      return;
    }

    // "1" alone: allow it (could be 1, 10-16)
    if (last === '1') {
      setValue(next);
      validateComplete(next);
      return;
    }

    // "2" through "9": valid single digits, auto-add "-"
    if (last.length === 1 && lastNum >= 2 && lastNum <= 9) {
      const newValue = next + '-';
      setValue(newValue);
      validateComplete(newValue);
      return;
    }

    // "10" through "16": valid two digits, auto-add "-"
    if (last.length === 2 && lastNum >= 10 && lastNum <= 16) {
      const newValue = next + '-';
      setValue(newValue);
      validateComplete(newValue);
      return;
    }

    // "17" or higher, or any invalid pattern: reject
    if (lastNum > 16 || (last.length === 2 && lastNum < 10)) {
      return;
    }

    // For any other case (like typing second digit after "1"), allow it
    setValue(next);
    validateComplete(next);
  };

  const validateComplete = (val: string) => {
    // Remove trailing hyphen for validation
    const cleanVal = val.endsWith('-') ? val.slice(0, -1) : val;
    const parts = cleanVal.split('-').filter((p) => p !== '');
    const numbers = parts.map((p) => parseInt(p)).filter((n) => !isNaN(n));

    if (numbers.length > 0 && numbers.length < 5) {
      setError('Minimum 5 tal påkrævet');
    } else if (numbers.length > 8) {
      setError('Maksimum 8 tal tilladt');
    } else {
      setError('');
    }
  };

  return (
    <Input
      label="Tal (1–16)"
      placeholder="1-2-3-4-5"
      value={value}
      onValueChange={handleChange}
      errorMessage={error}
      isInvalid={!!error}
      description="Indtast 5-8 unikke tal mellem 1-16"
    />
  );
}
