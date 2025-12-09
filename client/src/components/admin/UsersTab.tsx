'use client';

import { useState } from 'react';
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
} from '@heroui/react';
import { BsThreeDotsVertical } from 'react-icons/bs';

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
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'john@example.com',
      createdAt: new Date('2024-01-15'),
      balance: 5000,
      totalDeposits: 10000,
      isAdmin: true,
      isActive: true,
    },
    {
      id: '2',
      email: 'jane@example.com',
      createdAt: new Date('2024-02-20'),
      balance: 3500,
      totalDeposits: 7500,
      isAdmin: false,
      isActive: true,
    },
    {
      id: '3',
      email: 'mike@example.com',
      createdAt: new Date('2024-03-10'),
      balance: 8000,
      totalDeposits: 15000,
      isAdmin: false,
      isActive: true,
    },
    {
      id: '4',
      email: 'sarah@example.com',
      createdAt: new Date('2024-01-05'),
      balance: 0,
      totalDeposits: 2000,
      isAdmin: false,
      isActive: false,
    },
    {
      id: '5',
      email: 'sarsdfsdfah@example.com',
      createdAt: new Date('2024-01-05'),
      balance: 0,
      totalDeposits: 2000,
      isAdmin: false,
      isActive: false,
    },
    {
      id: '6',
      email: 'sasdfsdfrah@example.com',
      createdAt: new Date('2024-01-05'),
      balance: 0,
      totalDeposits: 2000,
      isAdmin: false,
      isActive: false,
    },
    {
      id: '7',
      email: 'sarsdfsdfah@example.com',
      createdAt: new Date('2024-01-05'),
      balance: 0,
      totalDeposits: 2000,
      isAdmin: false,
      isActive: false,
    },
    {
      id: '8',
      email: 'sarah@example.com',
      createdAt: new Date('2024-01-05'),
      balance: 0,
      totalDeposits: 2000,
      isAdmin: false,
      isActive: false,
    },
  ]);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const pages = Math.ceil(users.length / rowsPerPage);

  const paginatedUsers = users.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleMakeAdmin = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, isAdmin: true } : u)));
  };

  const handleDeactivate = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: false } : u)));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <Card className="border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm">
        <CardBody className="p-2 gap-2 overflow-x-auto">
          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <Input type="text" placeholder="Søg efter email..." />

            {/* Create button */}
            <Button
              color="primary"
              onPress={() => console.log('Create user clicked')}
              className="whitespace-nowrap"
            >
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
                      total={pages}
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
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell className="text-right font-semibold">{user.balance}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {user.totalDeposits}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.createdAt.toLocaleDateString('en-US', {
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
                                    key="make_admin"
                                    onClick={() => handleMakeAdmin(user.id)}
                                  >
                                    Make Admin
                                  </DropdownItem>
                                ) : null,

                                user.isActive ? (
                                  <DropdownItem
                                    key="deactivate"
                                    onClick={() => handleDeactivate(user.id)}
                                    className="text-danger"
                                    color="danger"
                                  >
                                    Deactivate
                                  </DropdownItem>
                                ) : null,
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
    </motion.div>
  );
}
