import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export const Loading: React.FC = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw"
      sx={{
        backgroundImage: "url('https://placehold.co/1600x896/DDDDDD/1045CC/webp?text=Background+Image')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <CircularProgress size={80} />
    </Box>
  );
};

export const LoadingAdmin: React.FC = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <CircularProgress size={80} />
    </Box>
  );
};