import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, CssBaseline, Avatar, ThemeProvider } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

interface Errors {
  username?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const [loginStatus, setLoginStatus] = useState<{ message: string, success: boolean } | null>(null);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        return value ? '' : 'Username is required';
      case 'password':
        return value ? '' : 'Password is required';
      default:
        return '';
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    }
    setErrors({
      ...errors,
      [name]: validateField(name, value)
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const newErrors: Errors = {
      username: validateField('username', username),
      password: validateField('password', password)
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BE_DOMAIN_NAME}/login`, {
        username,
        password
      }, { withCredentials: true });

      if (response.data.login) {
        setUsername('');
        setPassword('');
        setErrors({});
        setLoginStatus({ message: 'Login successful', success: true });
        navigate('/admin', { replace: true });
      } else {
        setLoginStatus({ message: 'Invalid username or password', success: false });
      }
    } catch (error) {
      setLoginStatus({ message: 'Invalid username or password', success: false });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container className="loginPageContainer">
        <Box bgcolor="#fafafa" p={4} borderRadius={2} display="inline-block" boxShadow={8} mt={2} maxWidth={400}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            {loginStatus && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 1,
                color: loginStatus.success ? 'success.main' : 'error.main',
              }}>
                {loginStatus.success ? <CheckCircleIcon /> : <ErrorIcon />}
                <Typography variant="body1" ml={1}>{loginStatus.message}</Typography>
              </Box>
            )}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={handleInputChange}
                error={!!errors.username}
                helperText={errors.username}
              />
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Login
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default LoginPage;
