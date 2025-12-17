import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Form,
  Input,
} from '@heroui/react';
import type { UserDtoExtended } from '../../generated-ts-client';
import { useEffect, useState } from 'react';
import type { UpdateUserPayload } from '../admin/UsersTab';

interface UserInfoDrawerProps {
  isOpen: boolean;
  onOpenChange: () => void;
  user: UserDtoExtended | undefined;
  onUpdate: (payload: UpdateUserPayload) => Promise<void>;
  isLoading: boolean;
}

type UserFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

function useUserForm(user?: UserDtoExtended, isOpen?: boolean) {
  const [form, setForm] = useState<UserFormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (isOpen && user) {
      setForm({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
      });
    }
  }, [isOpen, user]);

  return { form, setForm };
}

type UserFormErrors = Partial<Record<keyof UserFormState, string>>;

export default function UserInfoDrawer({
  user,
  isOpen,
  onOpenChange,
  onUpdate,
  isLoading,
}: UserInfoDrawerProps) {
  const { form, setForm } = useUserForm(user, isOpen);
  const [errors, setErrors] = useState<UserFormErrors>({});

  function validate(form: UserFormState): UserFormErrors {
    const errors: UserFormErrors = {};

    if (!form.firstName.trim()) {
      errors.firstName = 'Fornavn må ikke være tomt';
    }

    if (!form.lastName.trim()) {
      errors.lastName = 'Efternavn må ikke være tomt';
    }

    if (!form.email.trim()) {
      errors.email = 'Email må ikke være tom';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Email er ikke gyldig';
    }

    if (!/^\d{8}$/.test(form.phone)) {
      errors.phone = 'Telefonnummer skal være 8 cifre';
    }

    return errors;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) return;

    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await onUpdate({
      id: user.id,
      ...form,
    });
  };

  const handleChange = (field: keyof UserFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="flex flex-col gap-1">{user?.fullName}</DrawerHeader>
            <Form validationErrors={errors} onSubmit={handleSubmit}>
              <DrawerBody className="flex flex-col gap-4">
                <div className="flex flex-row gap-2">
                  <Input
                    name="firstName"
                    label="Fornavn"
                    value={form.firstName}
                    onChange={handleChange('firstName')}
                  />
                  <Input
                    name="lastName"
                    label="Efternavn"
                    className="max-w-45"
                    value={form.lastName}
                    onChange={handleChange('lastName')}
                  />
                </div>
                <Divider className="bg-primary/25" />
                <div className="flex flex-col gap-2">
                  <Input
                    name="email"
                    type="email"
                    label="Email"
                    value={form.email}
                    onChange={handleChange('email')}
                  />
                  <Input
                    name="phone"
                    type="tel"
                    label="Telefon"
                    value={form.phone}
                    onChange={handleChange('phone')}
                  />
                </div>
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Luk
                </Button>
                <Button isLoading={isLoading} color="primary" type="submit">
                  Opdater
                </Button>
              </DrawerFooter>
            </Form>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
