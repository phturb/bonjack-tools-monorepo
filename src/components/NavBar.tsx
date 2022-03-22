import {
  AppBar,
  Box,
  Menu,
  Container,
  Button,
  MenuItem,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { cryptoRoutes, gamesToolRoutes, homeRoute, otherProjects, routes } from "../routes";
import { Link as RouterLink } from "react-router-dom";

export type NavBarProperties = {};

const NavBar = (props: NavBarProperties) => {
  const [anchorElNav, setAnchorElNav] = useState<HTMLElement | null>(null);
  const [anchorElCrypto, setAnchorElCrypto] = useState<HTMLElement | null>(null);
  const [anchorElGames, setAnchorElGames] = useState<HTMLElement | null>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>, anchorSet: (value: React.SetStateAction<HTMLElement | null>) => void ) => {
    anchorSet(event.currentTarget);
  };

  const handleCloseNavMenu = (anchorSet: (value: React.SetStateAction<HTMLElement | null>) => void ) => {
    anchorSet(null);
  };

  const buttonNavGenerator = (route: { name: string, path: string }) => {
    return (
      <Button
        component={RouterLink}
        to={route.path}
        key={route.name + "-nav"}
        onClick={(event: React.MouseEvent<HTMLElement> ) => {handleCloseNavMenu(setAnchorElNav)}}
        sx={{ my: 2, color: "white", display: "block" }}
      >
        {route.name}
      </Button>
    );
  }

  const menuItemNavGenerator = (route: { name: string, path: string }) => {
    return (<MenuItem
      key={route.name + "-nav"}
      component={RouterLink}
      to={route.path}
      onClick={(event: React.MouseEvent<HTMLElement> ) => {handleCloseNavMenu(setAnchorElNav)}}
    >
      <Typography textAlign="center">{route.name}</Typography>
    </MenuItem>);
  }

  return (
    <Box>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              component="div"
              noWrap
              sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
            >
              BonJack Tools
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                color="inherit"
                onClick={(event: React.MouseEvent<HTMLElement> ) => {handleOpenUserMenu(event, setAnchorElNav)}}
              >

                <MenuIcon />
              </IconButton>
              <Menu
                id="navigation-menu"
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                anchorEl={anchorElNav}
                open={Boolean(anchorElNav)}
                onClose={(event: React.MouseEvent<HTMLElement> ) => {handleCloseNavMenu(setAnchorElNav)}}
              >
                {routes.map(menuItemNavGenerator)}
              </Menu>

            </Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
            >
              BonJack Tools
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {buttonNavGenerator(homeRoute)}

                <Button
                onClick={(event: React.MouseEvent<HTMLElement> ) => {handleOpenUserMenu(event, setAnchorElCrypto)}}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {cryptoRoutes.name}
              </Button>
              <Menu
                id={`navigation-menu-${cryptoRoutes.name}`}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                anchorEl={anchorElCrypto}
                open={Boolean(anchorElCrypto)}
                onClose={(event: React.MouseEvent<HTMLElement> ) => {handleCloseNavMenu(setAnchorElCrypto)}}
              >
                {cryptoRoutes.routes.map(menuItemNavGenerator)}
              </Menu>
              <Button
                onClick={(event: React.MouseEvent<HTMLElement> ) => {handleOpenUserMenu(event, setAnchorElGames)}}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {gamesToolRoutes.name}
              </Button>
              <Menu
                id={`navigation-menu-${gamesToolRoutes.name}`}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                anchorEl={anchorElGames}
                open={Boolean(anchorElGames)}
                onClose={(event: React.MouseEvent<HTMLElement> ) => {handleCloseNavMenu(setAnchorElGames)}}
              >
                {gamesToolRoutes.routes.map(menuItemNavGenerator)}
              </Menu>
              {buttonNavGenerator(otherProjects)}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
};

export default NavBar;
