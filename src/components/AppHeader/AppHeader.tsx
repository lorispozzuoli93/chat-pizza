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
    // AppBar fornisce la barra in alto, position="sticky" è una buona scelta
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>
        {/* LOGO E NOME APP (Sinistra) */}
        <Box display="flex" alignItems="center" flexGrow={1} gap={1}>

          {/* L'immagine della pizza.png dalla cartella public viene caricata qui */}
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

        {/* STATO DI LOGIN (Destra) */}
        {isAuthenticated && userId ? (
          <Box display="flex" gap={1} alignItems="center">

            <Typography variant="body2">Loggato come <strong>{userId}</strong></Typography>

            <Avatar sx={{ bgcolor: 'grey', width: 32, height: 32 }}>
              {userInitial}
            </Avatar>

            {/* Pulsante di Logout */}
            <IconButton color="error" onClick={onLogout} size="small">
              <LogoutIcon fontSize="small" />
            </IconButton>

          </Box>
        ) : (
          // Icona base per utente non autenticato o per il placeholder
          <IconButton color="inherit" disabled>
            <AccountCircleIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;