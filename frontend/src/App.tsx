import { lazy, Suspense } from 'react';
import Home from './pages/Home';
import { Loading, LoadingAdmin } from './components/Loading';
import './assets/App.css';
import { createTheme, CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const AppLayout = lazy(() => import('./pages/admin/AppLayout'))
const ReserveEvent = lazy(() => import('./pages/ReserveEvent'))
const CreateEvent = lazy(() => import('./pages/admin/CreateEvent'))
const EventReservationsOverview = lazy(() => import('./pages/admin/EventReservationsOverview'))
const ReservationDetails = lazy(() => import('./pages/ReservationDetails'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ProtectedRoute = lazy(() => import('./pages/admin/ProtectedRoute'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const DataPrivacy = lazy(() => import('./pages/DataPrivacy'))
const ReservationDetailsAdmin = lazy(() => import('./pages/admin/ReservationsDetailsAdmin'))

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#1045cc',
      },
      secondary: {
        main: '#666666',
      },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: "#666666",
          },
        },
      },
    },
  });

  const globalStyles = (
    <GlobalStyles
      styles={{
        body: {
          backgroundColor: 'transparent',
        },
      }}
    />
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <Suspense fallback={<Loading />}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="reserve" element={<ReserveEvent />} />
          <Route path='privacy-policy' element={<DataPrivacy />} />
          <Route path="reserve-details" element={<ReservationDetails />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route
                path="admin"
                element={
                  <Suspense fallback={<LoadingAdmin />}>
                    <CreateEvent />
                  </Suspense>
                }
              />
              <Route
                path="admin/reserve-overview"
                element={
                  <Suspense fallback={<LoadingAdmin />}>
                    <EventReservationsOverview />
                  </Suspense>
                }
              />
              <Route
                path="admin/qr-scanner"
                element={
                  <Suspense fallback={<LoadingAdmin />}>
                    <ReservationDetailsAdmin />
                  </Suspense>
                }
              />
            </Route>
          </Route>
        </Routes>
      </Router>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;