import Image from "next/image";
import {
  HoverCard,
  Group,
  Button,
  UnstyledButton,
  Text,
  SimpleGrid,
  ThemeIcon,
  Anchor,
  Divider,
  Center,
  Box,
  Burger,
  Drawer,
  Collapse,
  ScrollArea,
  rem,
  useMantineTheme,
  Loader,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./Navbar2.module.css";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getDecodedToken } from "../auth/getDecodedToken";
import { Company, CompanyPerson } from "../utils/types";

interface NavbarCompanyAdminProps {
  token: string | undefined;
  departmentsChanged: boolean;
}

const NavbarCompanyAdmin: React.FC<NavbarCompanyAdminProps> = ({
  token,
  departmentsChanged,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const [linksOpenedUsers, { toggle: toggleLinksUsers }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const [linksOpenedDepartments, { toggle: toggleLinksDepartments }] =
    useDisclosure(false);

  const theme = useMantineTheme();

  const [loadingQuery, setLoadingQuery] = useState(true);

  const decodedToken = getDecodedToken();
  const [userId, setUserId] = useState<string | null>(null);

  const personId = decodedToken ? decodedToken.userId : "";
  const personUsername = decodedToken ? decodedToken.username : "";

  useEffect(() => {
    if (decodedToken) {
      setUserId(decodedToken.userId);
    }
  }, [decodedToken]);

  const handleLogout = () => {
    localStorage.removeItem("jwtTokenAttendanceApp");
    router.push("/");
  };

  const [companies, setCompanies] = useState<Company[]>([]);

  //Fetch worker's companies
  const fetchData = useCallback(async () => {
    setLoadingQuery(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company-person?personId=${userId}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoadingQuery(false);

      if (response.ok) {
        const data: CompanyPerson[] = await response.json();
        const extractedCompanies = data.map((item) => ({
          id: item.company.id,
          name: item.company.name,
          abbreviation: item.company.abbreviation,
        }));
        setCompanies(extractedCompanies);
        // setResponse(responseData);
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData);
        }
      }
    } catch (error) {
      console.log("Error attempting to fetch data: ", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);


  const linksCompaniesForUsers = companies.map((item) => (
    <UnstyledButton key={item.id} className={classes.subLink}>
      <a href={`/company-admin/users?companyId=${item.id}`}>
        <Group wrap="nowrap" align="flex-start">
          <div>
            <Text size="sm" fw={500}>
              {item.abbreviation}
            </Text>
            <Text size="xs" c="dimmed">
              {item.name}
            </Text>
          </div>
        </Group>
      </a>
    </UnstyledButton>
  ));

  const linksFaculties = companies.map((item) => (
    <UnstyledButton key={item.id} className={classes.subLink}>
      <a href={`/company-admin/departments?companyId=${item.id}`}>
        <Group wrap="nowrap" align="flex-start">
          <div>
            <Text size="sm" fw={500}>
              {item.abbreviation}
            </Text>
            <Text size="xs" c="dimmed">
              {item.name}
            </Text>
          </div>
        </Group>
      </a>
    </UnstyledButton>
  ));


  return (
    <Box pb={30}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <Link href={"/company-admin/dashboard"}>
            <Image
              src="/assets/images/attendance-logo.png"
              alt="SUM"
              width={217}
              height={232}
              style={{ width: "auto", height: "45px" }}
            />
          </Link>

          <Group h="100%" gap={0} visibleFrom="sm">

            <HoverCard
              width={600}
              position="bottom"
              radius="md"
              shadow="md"
              withinPortal
            >
              <HoverCard.Target>
                <a href="#" className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5}>
                      Korisnici
                    </Box>
                    <Image
                      src="/assets/svgs/chevron-down.svg"
                      alt="Settings"
                      width={30}
                      height={30}
                      style={{ width: "0.9rem", height: "0.9rem" }}
                    />
                  </Center>
                </a>
              </HoverCard.Target>

              <HoverCard.Dropdown style={{ overflow: "hidden" }}>
                <Group justify="space-between" px="md">
                  <Text fw={500}>Korisnici</Text>
                </Group>

                <Divider my="sm" />

                <SimpleGrid cols={2} spacing={0}>
                  {loadingQuery ? (<Loader size={25} />) : (
                    linksCompaniesForUsers
                  )}

                </SimpleGrid>
              </HoverCard.Dropdown>
            </HoverCard>

            <HoverCard
              width={600}
              position="bottom"
              radius="md"
              shadow="md"
              withinPortal
            >
              <HoverCard.Target>
                <a href="#" className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5}>
                      Odjeli
                    </Box>
                    <Image
                      src="/assets/svgs/chevron-down.svg"
                      alt="Settings"
                      width={30}
                      height={30}
                      style={{ width: "0.9rem", height: "0.9rem" }}
                    />
                  </Center>
                </a>
              </HoverCard.Target>

              <HoverCard.Dropdown style={{ overflow: "hidden" }}>
                <Group justify="space-between" px="md">
                  <Text fw={500}>Odjeli</Text>
                </Group>

                <Divider my="sm" />

                <SimpleGrid cols={2} spacing={0}>
                {loadingQuery ? (<Loader size={25} />) : (
                    linksFaculties
                  )}
                </SimpleGrid>
              </HoverCard.Dropdown>
            </HoverCard>

            {/* <HoverCard
              width={600}
              position="bottom"
              radius="md"
              shadow="md"
              withinPortal
            >
            </HoverCard> */}
          </Group>

          <Group visibleFrom="sm">
            <Text
              style={{
                color: "var(--mantine-color-dark-3)",
                userSelect: "none",
              }}
            >
              Admin kompanije
            </Text>
            <Link
              href={{
                pathname: "/company-admin/profile",
                query: { personId: personId },
              }}
            >
              <Button>{personUsername}</Button>
            </Link>
            <Button variant="default" onClick={handleLogout}>
              Odjava
            </Button>
          </Group>

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="sm"
          />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Izbornik - Admin kompanije"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Divider my="sm" />

          <UnstyledButton className={classes.link} onClick={toggleLinksUsers}>
            <Center inline>
              <Box component="span" mr={5}>
                Korisnici
              </Box>
              <Image
                src="/assets/svgs/chevron-down.svg"
                alt="Settings"
                width={30}
                height={30}
                style={{ width: "0.9rem", height: "0.9rem" }}
              />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpenedUsers}>{linksCompaniesForUsers}</Collapse>

          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Odjeli
              </Box>
              <Image
                src="/assets/svgs/chevron-down.svg"
                alt="Settings"
                width={30}
                height={30}
                style={{ width: "0.9rem", height: "0.9rem" }}
              />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>{linksFaculties}</Collapse>

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            <Link
              href={{
                pathname: "/company-admin/profile",
                query: { personId: personId },
              }}
            >
              <Button fullWidth>{personUsername}</Button>
            </Link>
            <Button variant="default" onClick={handleLogout}>
              Odjava
            </Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
};

export default NavbarCompanyAdmin;
