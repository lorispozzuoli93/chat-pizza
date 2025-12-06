import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


interface AppHeaderProps {
  isAuthenticated: boolean;
  userId?: string;
  onLogout: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ isAuthenticated, userId, onLogout }) => {
  const userInitial = userId ? userId.charAt(0).toUpperCase() : '?';

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>
        <Box display="flex" alignItems="center" flexGrow={1} gap={1}>
          <Box
            component="img"
            src="/pizza.png"
            alt="Datapizza Logo"
            sx={{ height: 32, width: 32, marginRight: 1 }}
          />

          <Typography variant="h5" component="div" fontWeight="bold">
            Datapizza
          </Typography>
        </Box>

        {isAuthenticated && userId ? (
          <Box display="flex" gap={1} alignItems="center">

            <Typography variant="body2">Loggato come <strong>{userId}</strong></Typography>

            <Avatar sx={{ bgcolor: 'grey', width: 32, height: 32 }}>
              {userInitial}
            </Avatar>

            <IconButton color="error" onClick={onLogout} size="small">
              <LogoutIcon fontSize="small" />
            </IconButton>

          </Box>
        ) : (
          <IconButton color="inherit" disabled>
            <AccountCircleIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;