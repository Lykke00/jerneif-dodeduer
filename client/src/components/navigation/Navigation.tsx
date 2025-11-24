import { NavbarBrand, NavbarContent, Navbar, NavbarItem, Link } from '@heroui/react';

export default function Navigation() {
  return (
    <Navbar className="bg-neutral-50" isBlurred isBordered>
      <NavbarBrand>
        <p className="font-bold text-inherit">JerneIF</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#">
            Spil
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link aria-current="true" href="#">
            Indbetal
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Kontakt
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="#">Login</Link>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
