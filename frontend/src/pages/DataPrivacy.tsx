import React, { useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const DataPrivacy: React.FC = () => {
  const theme = useTheme();
  const email = "email@example.com"

  useEffect(() => {
    document.body.classList.add('dataPrivacyBackground');

    return () => {
      document.body.classList.remove('dataPrivacyBackground');
    };
  }, []);

  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        boxSizing: 'border-box',
        overflow: 'auto',
        mx: 2
      }}
    >
      <Card sx={{ boxShadow: 8, padding: theme.spacing(2), maxWidth: '800px' }}>
        <CardContent>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: theme.palette.primary.main, marginBottom: theme.spacing(2) }}
          >
            Online Reservation System Privacy Policy
          </Typography>
          <Box mb={2}>
            <Typography variant="body1" sx={{ color: theme.palette.text.primary, marginBottom: theme.spacing(2) }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </Typography>
            <Typography variant="h5" sx={{ color: theme.palette.primary.main, marginBottom: theme.spacing(1) }}>
              Data Retention
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.primary, marginBottom: theme.spacing(2) }}>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit: <span style={{ color: theme.palette.primary.main, fontWeight: "bold" }}>{email}</span>
            </Typography>
            <Typography variant="h5" sx={{ color: theme.palette.primary.main, marginBottom: theme.spacing(1) }}>
              Client’s Consent and Declaration
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam nisi ut aliquid.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DataPrivacy;
