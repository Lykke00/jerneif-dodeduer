import { NavbarBrand, NavbarContent, Navbar, NavbarItem } from '@heroui/react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const { pathname } = useLocation();

  const links = [
    { label: 'Spil', href: '/spil' },
    { label: 'Indbetal', href: '/indbetal' },
    { label: 'Kontakt', href: '/kontakt' },
  ];

  console.log(pathname);

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
          <Link to="/">Login</Link>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
