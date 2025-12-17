'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
  Input,
  Checkbox,
  Spinner,
  Form,
  NumberInput,
} from '@heroui/react';
import { useModal } from '../../contexts/ModalContext';

type FormState = {
  numbers: number[];
  amount: number;
  repeat: number;
};

type Props = {
  isOpen: boolean;
  onOpenChange: () => void;
  createBoard: (numbers: number[], amount: number, repeat: number) => Promise<void>;
  loading: boolean;
};

const initialForm: FormState = {
  numbers: [],
  amount: 1,
  repeat: 1,
};

export const UserBoardNewModal: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  createBoard,
  loading,
}) => {
  const { showModal } = useModal();
  const [form, setForm] = useState<FormState>(initialForm);
  const [numbersRaw, setNumbersRaw] = useState('');

  const updateField =
    <K extends keyof FormState>(field: K) =>
    (value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const onNumbersChange = (value: string) => {
    setNumbersRaw(value);

    const parsed = parseNumbers(value);
    if (parsed) {
      setForm((prev) => ({ ...prev, numbers: parsed }));
    } else {
      setForm((prev) => ({ ...prev, numbers: [] }));
    }
  };

  const numbersError =
    numbersRaw.length > 0 && form.numbers.length === 0
      ? 'Indtast 5–8 unikke tal mellem 1 og 16, adskilt med -'
      : undefined;

  const parseNumbers = (input: string): number[] | null => {
    const parts = input.split('-');

    if (parts.length < 5 || parts.length > 8) return null;

    const numbers = parts.map((p) => Number(p.trim()));

    if (numbers.some((n) => !Number.isInteger(n))) return null;
    if (numbers.some((n) => n < 1 || n > 16)) return null;

    const unique = new Set(numbers);
    if (unique.size !== numbers.length) return null;

    return numbers;
  };

  const onSubmit = async () => {
    try {
      await createBoard(form.numbers, form.amount, form.repeat);
      setForm(initialForm);
      onOpenChange();
    } catch (err) {
      showModal({
        variant: 'error',
        title: 'En fejl opstod',
        description: 'Kunne ikke hente spil-historik',
      });
    }
  };

  const isSubmitDisabled = loading || !form.numbers || !form.amount || !form.repeat;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="opaque">
      <ModalContent>
        {() => (
          <>
            <ModalHeader>Opret nyt autospil</ModalHeader>
            <Divider />

            <Form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
            >
              <ModalBody className="w-full">
                <div className="flex flex-col gap-2">
                  <Input
                    label="Tal (fx 1-2-3-4-5)"
                    placeholder="1-2-3-4-5"
                    value={numbersRaw}
                    onValueChange={onNumbersChange}
                    isInvalid={!!numbersError}
                    errorMessage={numbersError}
                    isDisabled={loading}
                    isRequired
                  />
                  <div className="flex flex-row gap-2">
                    <NumberInput
                      label="Antal"
                      placeholder="1"
                      minValue={1}
                      value={form.amount}
                      onValueChange={updateField('amount')}
                      isDisabled={loading}
                      isRequired
                      name="firstName"
                    />

                    <NumberInput
                      label="Ugentlige gentagelser"
                      placeholder="1"
                      minValue={1}
                      value={form.repeat}
                      onValueChange={updateField('repeat')}
                      isDisabled={loading}
                      isRequired
                      name="lastName"
                    />
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="w-full">
                <Button variant="light" onPress={onOpenChange} isDisabled={loading}>
                  Annuller
                </Button>

                <Button
                  type="submit"
                  color="primary"
                  isDisabled={isSubmitDisabled}
                  isLoading={loading}
                >
                  Opret
                </Button>
              </ModalFooter>
            </Form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
