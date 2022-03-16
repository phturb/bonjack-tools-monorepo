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
import { routes } from "../routes";
import { Link as RouterLink } from "react-router-dom";

export type NavBarProperties = {};

const NavBar = (props: NavBarProperties) => {
  const [anchorElNav, setAnchorElNav] = useState<HTMLElement | undefined>(
    undefined
  );

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(undefined);
  };

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
                onClick={handleOpenUserMenu}
              >
                <MenuIcon />
                <Menu
                  id="navigation-menu"
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  anchorEl={anchorElNav}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                >
                  {routes.map((route) => (
                    <MenuItem
                      key={route.name + "-nav"}
                      component={RouterLink}
                      to={route.path}
                      onClick={handleCloseNavMenu}
                    >
                      <Typography textAlign="center">{route.name}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </IconButton>
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
              {routes.map((route) => (
                <Button
                  component={RouterLink}
                  to={route.path}
                  key={route.name + "-nav"}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {route.name}
                </Button>
              ))}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
};

export default NavBar;
