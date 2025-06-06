import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Paper,
    MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('receptionist');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const { register } = useAuth(); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            
            await register(username, password, role);
            setSuccess(true);
            console.log('Registration successful on frontend!');
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error('Registration error caught in handleSubmit (frontend):', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                    Register New User
                </Typography>
                {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>User registered successfully! Redirecting to login...</Alert>}
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="new-username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        select
                        id="role"
                        label="Role"
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={loading}
                    >
                        <MenuItem value="receptionist">Receptionist</MenuItem>
                        <MenuItem value="nurse">Nurse</MenuItem>
                        <MenuItem value="doctor">Doctor</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                    </TextField>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default RegisterPage;
