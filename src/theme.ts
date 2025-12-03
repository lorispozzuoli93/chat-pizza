import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#1976d2' },
        secondary: { main: '#ff9800' },
    },
    components: {
        MuiButton: { defaultProps: { variant: 'contained' } },
    },
});

export default theme;
