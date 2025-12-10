'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Divider,
  Input,
  Select,
  SelectItem,
  Spinner,
  useDisclosure,
} from '@heroui/react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useDebounce, useUsers } from '../../hooks';
import { useModal } from '../../contexts/ModalContext';
import type { UserDtoExtended } from '../../generated-ts-client';
import { UserCreateModal } from '../modal/UserCreateModal';
import { errorToMessage } from '../../helpers/errorToMessage';

interface User {
  id: string;
  email: string;
  createdAt: Date;
  balance: number;
  totalDeposits: number;
  isAdmin: boolean;
  isActive: boolean;
}

export default function UsersTab() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [search, setSearch] = useState('');
  const [sortActive, setSortActive] = useState<boolean | undefined>(undefined);
  const debouncedSearch = useDebounce(search, 400);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [allUsers, setAllUsers] = useState<UserDtoExtended[]>([]);
  const { showModal } = useModal();

  const pageSize = 10;
  const totalPages = Math.ceil(totalCount / pageSize);

  const { getAll, update, create, isLoading } = useUsers();

  useEffect(() => {
    let isActive = true;

    (async () => {
      const res = await getAll(search, page, pageSize, sortActive);
      if (!isActive) return;
      setAllUsers(res.items);
      setTotalCount(res.totalCount);
    })();

    return () => {
      isActive = false;
    };
  }, [page, debouncedSearch, sortActive]);

  const createUser = async (email: string, isAdmin: boolean) => {
    try {
      const createdUser = await create(email, isAdmin);

      setAllUsers((prev) => [createdUser, ...prev]);
      setTotalCount((prev) => prev + 1);

      showModal({
        variant: 'success',
        title: 'Bruger oprettet',
        description: `Brugeren ${email} er oprettet.`,
      });
    } catch (e) {
      showModal({
        variant: 'error',
        title: 'En fejl opstod',
        description: errorToMessage(e),
      });
    }
  };

  const updateUserRole = async (id: string, admin: boolean) => {
    try {
      const updatedUser = await update(id, undefined, admin);

      setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

      showModal({
        variant: 'success',
        title: 'Bruger oprettet',
        description: `Brugeren blev gjort ${admin ? 'administrator' : 'bruger'}.`,
      });
    } catch (e) {
      showModal({
        variant: 'error',
        title: 'En fejl opstod',
        description: errorToMessage(e),
      });
    }
  };

  const updateActive = async (id: string, active: boolean) => {
    try {
      const updatedUser = await update(id, active, undefined);

      setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

      showModal({
        variant: 'success',
        title: 'Bruger oprettet',
        description: `Brugeren blev ${active ? 'aktiveret' : 'deaktiveret'}.`,
      });
    } catch (e) {
      showModal({
        variant: 'error',
        title: 'En fejl opstod',
        description: errorToMessage(e),
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <Card className="border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm">
        <CardBody className="p-2 gap-2 overflow-x-auto">
          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <Select
              className="max-w-1/6"
              selectedKeys={
                new Set([sortActive === undefined ? 'all' : sortActive ? 'active' : 'deactivated'])
              }
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0];

                if (key === 'all') {
                  setSortActive(undefined);
                } else if (key === 'active') {
                  setSortActive(true);
                } else if (key === 'deactivated') {
                  setSortActive(false);
                }

                setPage(1);
              }}
            >
              <SelectItem key="all">Alle</SelectItem>
              <SelectItem key="active">Aktive</SelectItem>
              <SelectItem key="deactivated">Deaktiveret</SelectItem>
            </Select>

            {/* Search */}
            <Input
              type="text"
              placeholder="Søg efter email..."
              value={search}
              onValueChange={setSearch}
            />

            {/* Create button */}
            <Button color="primary" onPress={() => onOpenChange()} className="whitespace-nowrap">
              Opret ny
            </Button>
          </div>

          <Divider />

          <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Table
                aria-label="Users table"
                removeWrapper
                bottomContent={
                  <div className="flex mb-2 w-full justify-center">
                    <Pagination
                      showControls
                      page={page}
                      total={totalPages}
                      onChange={setPage}
                      size="sm"
                    />
                  </div>
                }
              >
                <TableHeader>
                  <TableColumn>EMAIL</TableColumn>
                  <TableColumn align="end">BALANCE</TableColumn>
                  <TableColumn align="end">INDBETALNINGER</TableColumn>
                  <TableColumn align="end">OPRETTET</TableColumn>
                  <TableColumn align="end">STATUS</TableColumn>
                  <TableColumn align="end">{''}</TableColumn>
                </TableHeader>
                <TableBody isLoading={isLoading} loadingContent={<Spinner label="Indlæser..." />}>
                  {allUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell className="text-right font-semibold">{user.balance}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {user.totalDeposits}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          {user.isAdmin && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100/30 dark:bg-blue-900/10 text-blue-800 dark:text-blue-200">
                              Admin
                            </span>
                          )}
                          {!user.isActive && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100/30 dark:bg-red-900/10 text-red-800 dark:text-red-200">
                              Inactive
                            </span>
                          )}
                          {user.isActive && !user.isAdmin && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100/30 dark:bg-green-900/10 text-green-800 dark:text-green-200">
                              Active
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <BsThreeDotsVertical className="w-4 h-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                              {[
                                !user.isAdmin ? (
                                  <DropdownItem
                                    onPress={() => updateUserRole(user.id, true)}
                                    key="make_admin"
                                  >
                                    Gør administrator
                                  </DropdownItem>
                                ) : (
                                  <DropdownItem
                                    onPress={() => updateUserRole(user.id, false)}
                                    key="make_user"
                                  >
                                    Degrader til bruger
                                  </DropdownItem>
                                ),

                                user.isActive ? (
                                  <DropdownItem
                                    onPress={() => updateActive(user.id, false)}
                                    key="deactivate"
                                    className="text-danger"
                                    color="danger"
                                  >
                                    Deaktiver
                                  </DropdownItem>
                                ) : (
                                  <DropdownItem
                                    onPress={() => updateActive(user.id, true)}
                                    key="deactivate"
                                    className="text-green-900"
                                    color="success"
                                  >
                                    Aktiver
                                  </DropdownItem>
                                ),
                              ]}
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          </AnimatePresence>
        </CardBody>
      </Card>

      <UserCreateModal createUser={createUser} isOpen={isOpen} onOpenChange={onOpenChange} />
    </motion.div>
  );
}
