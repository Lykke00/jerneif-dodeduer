import {
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  Navbar,
  NavbarItem,
  Link,
  Button,
} from '@heroui/react';

export default function Navigation() {
  return (
    <Navbar isBlurred isBordered>
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
          <Link aria-current="page" href="#">
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
        <NavbarItem>
          <Button as={Link} color="primary" href="#" variant="flat">
            Registrering
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
