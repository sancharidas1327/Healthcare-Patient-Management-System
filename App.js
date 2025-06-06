import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar';
import PatientList from './pages/PatientList';
import AddPatient from './pages/AddPatient';
import PatientDetail from './pages/PatientDetail';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; 
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2196f3',
        },
        secondary: {
            main: '#4caf50',
        },
        background: {
            default: '#f4f6f8',
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AuthProvider>
                    <Navbar />
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} /> {/* New Register Route */}

                        {}
                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <PatientList />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/patients"
                            element={
                                <PrivateRoute>
                                    <PatientList />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/patients/add"
                            element={
                                <PrivateRoute allowedRoles={['receptionist', 'admin']}>
                                    <AddPatient />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/patients/:id"
                            element={
                                <PrivateRoute>
                                    <PatientDetail />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/analytics"
                            element={
                                <PrivateRoute allowedRoles={['doctor', 'admin']}>
                                    <AnalyticsPage />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;
