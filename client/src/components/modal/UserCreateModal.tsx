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
} from '@heroui/react';

type FormState = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type Props = {
  isOpen: boolean;
  onOpenChange: () => void;
  createUser: (
    firstName: string,
    lastName: string,
    phone: string,
    email: string,
    isAdmin: boolean
  ) => Promise<void>;
};

const initialForm: FormState = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
};

export const UserCreateModal: React.FC<Props> = ({ isOpen, onOpenChange, createUser }) => {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateField =
    <K extends keyof FormState>(field: K) =>
    (value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const resetForm = () => {
    setForm(initialForm);
    setIsAdmin(false);
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      await createUser(form.firstName, form.lastName, form.phone, form.email, isAdmin);
      resetForm();
      onOpenChange();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    loading || !form.email || !form.firstName || !form.lastName || !/^\d{8}$/.test(form.phone);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="opaque">
      <ModalContent>
        {() => (
          <>
            <ModalHeader>Opret bruger</ModalHeader>
            <Divider />

            <Form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
            >
              <ModalBody className="w-full">
                <div className="flex flex-row gap-2">
                  <Input
                    label="Fornavn"
                    placeholder="Jørgen"
                    value={form.firstName}
                    onValueChange={updateField('firstName')}
                    isDisabled={loading}
                    isRequired
                    name="firstName"
                  />

                  <Input
                    label="Efternavn"
                    placeholder="Hansen"
                    value={form.lastName}
                    onValueChange={updateField('lastName')}
                    isDisabled={loading}
                    isRequired
                    name="lastName"
                  />
                </div>

                <Input
                  label="Email"
                  placeholder="jorgen@hansen.dk"
                  value={form.email}
                  onValueChange={updateField('email')}
                  isDisabled={loading}
                  type="email"
                  isRequired
                  name="email"
                />

                <Input
                  label="Telefonnummer"
                  placeholder="12345678"
                  value={form.phone}
                  onValueChange={(value) =>
                    updateField('phone')(value.replace(/\D/g, '').slice(0, 8))
                  }
                  isDisabled={loading}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{8}"
                  maxLength={8}
                  isRequired
                  name="phone"
                />

                <Divider />

                <Checkbox
                  isSelected={isAdmin}
                  onValueChange={setIsAdmin}
                  isDisabled={loading}
                  name="isAdmin"
                >
                  Gør administrator
                </Checkbox>
              </ModalBody>

              <ModalFooter className="w-full">
                <Button variant="light" onPress={onOpenChange} isDisabled={loading}>
                  Annuller
                </Button>

                <Button
                  type="submit"
                  color="primary"
                  isDisabled={isSubmitDisabled}
                  endContent={loading ? <Spinner size="sm" /> : null}
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
