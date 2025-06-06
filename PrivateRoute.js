import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box, Alert } from '@mui/material';
const PrivateRoute = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, loading } = useAuth(); 
    const location = useLocation(); 

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="warning">
                    You do not have permission to access this page. Your role is: {user.role}.
                </Alert>
                {}
                {}
            </Box>
        );
    }
    return children;
};

export default PrivateRoute;
