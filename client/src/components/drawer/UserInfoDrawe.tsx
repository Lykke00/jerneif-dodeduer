import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Input,
} from '@heroui/react';
import type { UserDtoExtended } from '../../generated-ts-client';

interface UserInfoDrawerProps {
  isOpen: boolean;
  onOpenChange: () => void;
  user: UserDtoExtended | undefined;
}

export default function UserInfoDrawer({ user, isOpen, onOpenChange }: UserInfoDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="flex flex-col gap-1">{user?.fullName}</DrawerHeader>
            <DrawerBody className="flex flex-col gap-4">
              <div className="flex flex-row gap-2">
                <Input label="Fornavn" value={user?.firstName} />
                <Input label="Efternavn" className="max-w-45" value={user?.lastName} />
              </div>
              <Divider className="bg-primary/25" />
              <div className="flex flex-col gap-2">
                <Input label="Email" value={user?.email} />
                <Input label="Telefon" value={user?.phone} />
              </div>
            </DrawerBody>
            <DrawerFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Luk
              </Button>
              <Button color="primary" onPress={onClose}>
                Opdater
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
