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

type Props = {
  isOpen: boolean;
  onOpenChange: () => void;
  createUser: (email: string, isAdmin: boolean) => Promise<void>;
};

export const UserCreateModal: React.FC<Props> = ({ isOpen, onOpenChange, createUser }) => {
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);

      await createUser(email, isAdmin);

      setEmail('');
      setIsAdmin(false);
      onOpenChange();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onOpenChange={onOpenChange} isOpen={isOpen} backdrop="opaque">
      <ModalContent>
        {() => (
          <>
            <ModalHeader>Opret bruger</ModalHeader>

            <Divider />

            <Form
              className="w-full"
              onSubmit={async (e) => {
                e.preventDefault();
                await onSubmit();
              }}
            >
              <ModalBody className="w-full">
                <Input
                  label="Email"
                  placeholder="indtast email..."
                  value={email}
                  onValueChange={setEmail}
                  isDisabled={loading}
                  type="email"
                  isRequired
                  name="email"
                />

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
                  isDisabled={!email || loading}
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
