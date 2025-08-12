// src/Layout/Nav.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ImageIcon from "@mui/icons-material/Image";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// Dummy hook for color mode, replace with your own context hook
const useColorMode = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const toggleColorMode = () => {
    alert("Toggle theme called - implement this yourself!");
  };
  return { mode, toggleColorMode };
};

const Nav = ({ onCategoryChange, currentCategory, isLoggedIn, onLogout }) => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    onLogout();
    handleMenuClose();
  };

  const menuOpen = Boolean(anchorEl);

  const categories = [
    { id: "images", label: "Images", icon: <ImageIcon /> },
    { id: "videos", label: "Videos", icon: <VideoLibraryIcon /> },
    { id: "audio", label: "Audio", icon: <AudiotrackIcon /> },
    { id: "documents", label: "Documents", icon: <DescriptionIcon /> },
  ];

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Typography variant="h6" sx={{ px: 2, mb: 2 }}>
        Categories
      </Typography>
      <Divider />
      <List>
        {categories.map((category) => (
          <ListItem
            button
            key={category.id}
            selected={currentCategory === category.id}
            onClick={() => {
              onCategoryChange(category.id);
              if (isMobile) setDrawerOpen(false);
            }}
            sx={{
              bgcolor:
                currentCategory === category.id
                  ? `${theme.palette.primary.main}20`
                  : "transparent",
              borderRight:
                currentCategory === category.id
                  ? `3px solid ${theme.palette.primary.main}`
                  : "none",
            }}
          >
            <ListItemIcon>{category.icon}</ListItemIcon>
            <ListItemText primary={category.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Media Manager
          </Typography>

          <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Account settings">
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={menuOpen ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? "true" : undefined}
            >
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}
              >
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>My Account</MenuItem>
        <Divider />
        {isLoggedIn ? (
          <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
        ) : (
          <MenuItem onClick={handleMenuClose}>Login</MenuItem>
        )}
      </Menu>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? drawerOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 250,
          },
          display: { xs: "block", md: isMobile ? "none" : "block" },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Nav;
