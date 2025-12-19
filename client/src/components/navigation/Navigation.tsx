import {
  NavbarBrand,
  NavbarContent,
  Navbar,
  NavbarItem,
  Button,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Divider,
  Chip,
} from '@heroui/react';
import { Link, useLocation } from 'react-router-dom';
import { PageRoutes } from '../../PageRoutes';
import { useModal } from '../../contexts/ModalContext';
import { errorToMessage } from '../../helpers/errorToMessage';
import { Fragment, useState } from 'react';
import { isActiveRoute } from '../../helpers/isActiveRoute';
import { BiChevronDown, BiChevronRight } from 'react-icons/bi';
import { useAuthContext } from '../../contexts/AuthContext';

export default function Navigation() {
  const { pathname } = useLocation();
  const { user, logout } = useAuthContext();
  const { showModal } = useModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdminPage = isActiveRoute(pathname, PageRoutes.Admin);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const links = [
    { label: 'Spil', href: PageRoutes.Game },
    { label: 'Bræt', href: PageRoutes.Boards },

    { label: 'Indbetal', href: PageRoutes.Deposit },
  ];

  const logUserOut = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (e) {
      showModal({
        variant: 'error',
        title: 'En fejl opstod',
        description: errorToMessage(e),
      });
    }
  };

  return (
    <Navbar
      isBordered
      isBlurred
      className="bg-neutral-50"
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
    >
      {/* Left: Logo */}
      <NavbarBrand className="flex flex-row gap-3">
        <img
          className="w-10 h-10 object-contain drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
          src="/logo.png"
          alt="Logo"
        />
        <p className="font-bold text-neutral-800">JerneIF</p>
      </NavbarBrand>

      {/* Burger toggle only on mobile */}
      <NavbarContent className="sm:hidden" justify="end">
        {user && (
          <NavbarMenuItem>
            <Chip className="border text-white bg-primary border-primary/50">
              {' '}
              Din saldo: {user.balance},-
            </Chip>
          </NavbarMenuItem>
        )}
        <NavbarMenuToggle aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} />
      </NavbarContent>

      {/* Desktop links */}
      {user ? (
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {links.map(({ label, href }) => (
            <NavbarItem key={href} isActive={isActiveRoute(pathname, href)}>
              <Link
                to={href}
                className={`transition-colors duration-200 ${
                  isActiveRoute(pathname, href)
                    ? 'text-primary'
                    : 'text-foreground-600 hover:text-foreground-800'
                }`}
              >
                {label}
              </Link>
            </NavbarItem>
          ))}

          {user.isAdmin && (
            <NavbarItem key="admin" isActive={isAdminPage}>
              <Link
                to={PageRoutes.AdminUsers}
                className={`transition-colors duration-200 ${
                  isAdminPage ? 'text-primary' : 'text-foreground-600 hover:text-foreground-800'
                }`}
              >
                Admin
              </Link>
            </NavbarItem>
          )}
        </NavbarContent>
      ) : (
        <NavbarContent className="hidden sm:flex" justify="center">
          <NavbarItem isActive>
            <span className="text-neutral-800 text-2xl">Døde Duer</span>
          </NavbarItem>
        </NavbarContent>
      )}

      {/* Right: Login/Logout */}
      <NavbarContent justify="end" className="hidden sm:flex">
        {user ? (
          <>
            <NavbarMenuItem>
              <Chip className="border text-white bg-primary border-primary/50">
                Din saldo: {user.balance},-
              </Chip>
            </NavbarMenuItem>

            <Button onPress={logUserOut} variant="light">
              Log ud
            </Button>
          </>
        ) : (
          <Link to="/">Login</Link>
        )}
      </NavbarContent>

      {/* Mobile menu */}
      <NavbarMenu>
        {user ? (
          <>
            {links.map(({ label, href }, index) => (
              <Fragment key={href}>
                <NavbarMenuItem>
                  <Link
                    to={href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`w-full block py-2 text-lg ${
                      isActiveRoute(pathname, href)
                        ? 'text-primary font-semibold'
                        : 'text-neutral-800'
                    }`}
                  >
                    {label}
                  </Link>
                </NavbarMenuItem>

                {index < links.length - 1 && <Divider />}
              </Fragment>
            ))}

            {user.isAdmin && (
              <>
                <Divider />

                {/* ADMIN TOGGLE */}
                <NavbarMenuItem>
                  <button
                    onClick={() => setIsAdminOpen((v) => !v)}
                    className="w-full flex items-center justify-between py-2 text-lg text-neutral-800"
                  >
                    <span>Admin</span>
                    {isAdminOpen ? <BiChevronDown /> : <BiChevronRight />}
                  </button>
                </NavbarMenuItem>

                {/* ADMIN LINKS */}
                {isAdminOpen && (
                  <div className="pl-4 space-y-1">
                    <NavbarMenuItem>
                      <Link
                        to={PageRoutes.AdminUsers}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block py-2 text-base ${
                          isActiveRoute(pathname, PageRoutes.AdminUsers)
                            ? 'text-primary font-semibold'
                            : 'text-neutral-700'
                        }`}
                      >
                        Brugere
                      </Link>
                    </NavbarMenuItem>

                    <NavbarMenuItem>
                      <Link
                        to={PageRoutes.AdminDeposits}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block py-2 text-base ${
                          isActiveRoute(pathname, PageRoutes.AdminDeposits)
                            ? 'text-primary font-semibold'
                            : 'text-neutral-700'
                        }`}
                      >
                        Indbetalinger
                      </Link>
                    </NavbarMenuItem>

                    <NavbarMenuItem>
                      <Link
                        to={PageRoutes.AdminGame}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block py-2 text-base ${
                          isActiveRoute(pathname, PageRoutes.AdminGame)
                            ? 'text-primary font-semibold'
                            : 'text-neutral-700'
                        }`}
                      >
                        Nuværende spil
                      </Link>
                    </NavbarMenuItem>
                    <NavbarMenuItem>
                      <Link
                        to={PageRoutes.AdminGameHistory}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block py-2 text-base ${
                          isActiveRoute(pathname, PageRoutes.AdminGameHistory)
                            ? 'text-primary font-semibold'
                            : 'text-neutral-700'
                        }`}
                      >
                        Spil historik
                      </Link>
                    </NavbarMenuItem>
                  </div>
                )}
              </>
            )}

            <NavbarMenuItem className="border rounded-md border-primary/50">
              <Button
                onPress={async () => {
                  await logUserOut();
                  setIsMenuOpen(false);
                }}
                variant="light"
                className="w-full"
              >
                Log ud
              </Button>
            </NavbarMenuItem>
          </>
        ) : (
          <NavbarMenuItem className="border border-e-neutral-200">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2 text-lg">
              Login
            </Link>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </Navbar>
  );
}
