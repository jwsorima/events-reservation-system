import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

import {
  Box,
  Grid,
  useMediaQuery,
  useTheme,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from "@mui/material";

import HomeIcon from '@mui/icons-material/Home';
import EventNoteIcon from '@mui/icons-material/EventNote';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

import { LogOut } from '../../utils/auth';
import Logo from '../../../src/assets/490x490.svg?react';

const drawerWidth = 210;

export default function AppLayout() {
  const [active, setActive] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogoutClick = () => {
    LogOut(navigate).catch((error: unknown) => {
      if (error instanceof Error) {
        navigate('/login', { replace: true });
        console.error('Logout failed', error.message);
      } else {
        console.error('Logout failed', error);
      }
    });
  };

  const drawerContent = (
    <>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 1, maxHeight: '64px', my: { xs: 3, md: 2 } }}>
        <Logo 
          style={{ 
            width: '50%', 
            height: 'auto', 
            borderRadius: '50%',
          }}
          viewBox="0 0 500 500" 
        />
      </Toolbar>
      <Divider sx={{ borderColor: theme.palette.secondary.main}} />
      <List>
        <ListItem disablePadding component={Link} to="admin" 
          sx={{bgcolor: active === "admin" ? "primary.light" : undefined}}
        >
          <ListItemButton sx={{paddingX: 1}} onClick={() => {setActive("admin")}}>
            <ListItemIcon sx={{ minWidth: '40px' }}>
              <HomeIcon style={{ color: "white"}} />
            </ListItemIcon>
            <ListItemText disableTypography 
              primary={<Typography variant="body1" style={{ color: 'white', textAlign: 'left' }}>Create Event</Typography>}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding component={Link} to="admin/reserve-overview" 
          sx={{bgcolor: active === "reserve-overview" ? "primary.light" : undefined}}
        >
          <ListItemButton sx={{paddingX: 1}} onClick={() => {setActive("reserve-overview")}}>
            <ListItemIcon sx={{ minWidth: '40px' }}>
              <EventNoteIcon style={{ color: "white"}} />
            </ListItemIcon>
            <ListItemText disableTypography 
              primary={<Typography variant="body1" style={{ color: 'white', textAlign: 'left' }}>Event Reservations</Typography>}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding component={Link} to="admin/qr-scanner" 
          sx={{bgcolor: active === "qr-scanner" ? "primary.light" : undefined}}
        >
          <ListItemButton sx={{paddingX: 1}} onClick={() => {setActive("qr-scanner")}}>
            <ListItemIcon sx={{ minWidth: '40px' }}>
              <QrCodeScannerIcon style={{ color: "white"}} />
            </ListItemIcon>
            <ListItemText disableTypography 
              primary={<Typography variant="body1" style={{ color: 'white', textAlign: 'left' }}>QR Scanner</Typography>}
            />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider sx={{ borderColor: theme.palette.secondary.main }} />
      <List sx={{marginTop: 'auto'}}>
        <ListItem disablePadding 
          sx={{ 
            color: 'white'
          }}
        >
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: 'flex-start',
              px: 2.5,
            }}
            onClick={handleLogoutClick}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 3,
                justifyContent: 'center',
              }}
            >
              <LogoutIcon style={{color: 'white'}} />
            </ListItemIcon>
            <ListItemText 
              primary={'Logout'}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Grid container spacing={0} sx={{ height: '100vh' }}>
      {isXs && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 2, backgroundColor: 'transparent', boxShadow: 'none' }}>
          <Toolbar sx={{ minHeight: 48 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 2,
                backgroundColor: theme.palette.primary.main,
                borderRadius: 1,
                padding: 1,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}
      <Grid item sx={{ height: '100%' }}>
        <Drawer
          variant={isXs ? "temporary" : "permanent"}
          open={isXs ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: theme.palette.primary.dark,
              zIndex: theme.zIndex.drawer + 1,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Grid>
      <Grid item xs sx={{ height: '100%' }}>
        <Box
          component="main"
          sx={{ height: '100%', bgcolor: 'background.default', p: 3, ml: 0, mt: isXs ? 6 : 0 }}
        >
          <Outlet />
        </Box>
      </Grid>
    </Grid>
  );
}
