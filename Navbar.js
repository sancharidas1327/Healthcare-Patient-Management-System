import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

function Navbar() {
    const { isAuthenticated, user, logout } = useAuth(); 

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    HPMS
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {isAuthenticated ? (
                        <>
                            <Button color="inherit" component={Link} to="/patients">
                                Patients
                            </Button>
                            <Button color="inherit" component={Link} to="/patients/add">
                                Add Patient
                            </Button>
                            <Button color="inherit" component={Link} to="/analytics">
                                Analytics
                            </Button>
                            <Typography variant="body1" color="inherit" sx={{ alignSelf: 'center', mr: 1 }}>
                                ({user.username} - {user.role})
                            </Typography>
                            <Button color="inherit" onClick={logout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" component={Link} to="/login">
                                    Login
                                </Button>
                                {}
                                <Button color="inherit" component={Link} to="/register">
                                    Register
                                </Button>
                        </> 
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
