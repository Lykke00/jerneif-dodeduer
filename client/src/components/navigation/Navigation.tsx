import { NavbarBrand, NavbarContent, Navbar, NavbarItem, Button } from '@heroui/react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { PageRoutes } from '../../PageRoutes';
import { useModal } from '../../contexts/ModalContext';
import { errorToMessage } from '../../helpers/errorToMessage';

export default function Navigation() {
  const { pathname } = useLocation();
  const { user, logout, isLoading } = useAuth();
  const { showModal } = useModal();

  const links = [
    { label: 'Spil', href: PageRoutes.Game },
    { label: 'Indbetal', href: PageRoutes.Deposit },
    { label: 'Kontakt', href: PageRoutes.Contact },
  ];

  const logUserOut = async () => {
    try {
      await logout();
    } catch (e) {
      showModal({
        variant: 'error',
        title: 'En fejl opstod',
        description: errorToMessage(e),
      });
    }
  };

  return (
    <Navbar className="bg-neutral-50" isBlurred isBordered>
      <NavbarBrand className="flex flex-row gap-3">
        <img
          className="w-10 h-10 object-contain drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
          src="/logo.png"
          alt="Logo"
        />

        <p className="font-bold text-neutral-800">JerneIF</p>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {links.map(({ label, href }) => (
          <NavbarItem className="font-semibold" key={href} isActive={pathname === href}>
            <Link
              to={href}
              className={`transition-colors duration-200 ${
                pathname === href ? 'text-primary' : 'text-foreground-600 hover:text-foreground-800'
              }`}
            >
              {label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          {user === null ? (
            <Link to="/">Login</Link>
          ) : (
            <Button onPress={logUserOut} variant="light">
              Log ud
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
