import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import type { UserDtoExtended } from '../../generated-ts-client';

export default function UserCard({
  user,
  onOpenInfo,
}: {
  user: UserDtoExtended;
  onOpenInfo: () => void;
}) {
  return (
    <div className="rounded-lg border border-primary/20 bg-card px-4 py-3 shadow-sm">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            className="font-semibold text-base text-foreground cursor-pointer"
            onClick={onOpenInfo}
          >
            {user.fullName}
          </div>

          <div className="mt-0.5 text-xs text-foreground/60">
            {user.isAdmin && 'Admin'}
            {user.isAdmin && user.isActive && ' • '}
            {!user.isAdmin && user.isActive && 'Aktiv'}
            {!user.isActive && 'Inaktiv'}
          </div>
        </div>

        {/* ACTIONS */}
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly size="sm" variant="light">
              <BsThreeDotsVertical className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem key="info" onPress={onOpenInfo}>
              Vis info
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* INFO GRID */}
      <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
        <div className="text-foreground/60">Saldo</div>
        <div className="text-right font-medium">{user.balance} kr</div>

        <div className="text-foreground/60">Indbetalinger</div>
        <div className="text-right font-medium">{user.totalDeposits}</div>

        <div className="text-foreground/60">Oprettet</div>
        <div className="text-right text-foreground/70">
          {new Date(user.createdAt).toLocaleDateString('da-DK', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </div>
    </div>
  );
}
