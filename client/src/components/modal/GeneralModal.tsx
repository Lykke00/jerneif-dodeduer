import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
} from '@heroui/react';
import { PiExclamationMark } from 'react-icons/pi';
import { HiInformationCircle } from 'react-icons/hi';
import { BiCheckCircle, BiXCircle } from 'react-icons/bi';

type Variant = 'warning' | 'info' | 'error' | 'success';

type Props = {
  variant: Variant;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  backdrop?: 'opaque' | 'blur' | 'transparent';
};

type ButtonColor = 'warning' | 'success' | 'primary' | 'danger' | 'default' | 'secondary';

const variantsConfig: Record<Variant, { color: ButtonColor; Icon: React.ElementType }> = {
  warning: { color: 'warning', Icon: PiExclamationMark },
  info: { color: 'default', Icon: HiInformationCircle },
  error: { color: 'danger', Icon: BiXCircle },
  success: { color: 'primary', Icon: BiCheckCircle },
};

export const GeneralModal: React.FC<Props> = ({
  variant,
  isOpen,
  onClose,
  title,
  description,
  backdrop = 'opaque',
}) => {
  const { color, Icon } = variantsConfig[variant];

  return (
    <Modal backdrop={backdrop} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <Icon className="h-6 w-6" />
              {title}
            </ModalHeader>

            <Divider />

            <ModalBody className="mt-2">
              <p className="text-md">{description}</p>
            </ModalBody>

            <ModalFooter>
              <Button color={'primary'} onPress={onClose}>
                OK
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
