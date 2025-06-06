import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    Grid,
    Alert,
    CircularProgress,
    MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import patientService from '../services/patientService';
import moment from 'moment'; 

function AddPatient() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        patientId: '',
        name: { firstName: '', lastName: '' },
        dateOfBirth: '', 
        gender: '',
        contact: { phone: '', email: '' },
        address: { street: '', city: '', state: '', zipCode: '' },
        bloodGroup: '',
        allergies: [], 
        medicalHistory: [],
        currentPrescriptions: [],
        visits: [],
        doctorNotes: [],
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleArrayChange = (e, fieldName) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [fieldName]: value.split(',').map((item) => item.trim()).filter(item => item),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(null);
        if (!formData.patientId || !formData.name.firstName || !formData.name.lastName || !formData.dateOfBirth || !formData.gender || !formData.contact.phone) {
            setError('Please fill in all required fields: Patient ID, First Name, Last Name, Date of Birth, Gender, Phone.');
            setLoading(false);
            return;
        }
        try {
            const patientDataToSend = {
                ...formData,
                dateOfBirth: moment(formData.dateOfBirth).toISOString(),
                
            };

            await patientService.addPatient(patientDataToSend);
            setSuccess(true);
            setFormData({ 
                patientId: '',
                name: { firstName: '', lastName: '' },
                dateOfBirth: '',
                gender: '',
                contact: { phone: '', email: '' },
                address: { street: '', city: '', state: '', zipCode: '' },
                bloodGroup: '',
                allergies: [],
                medicalHistory: [],
                currentPrescriptions: [],
                visits: [],
                doctorNotes: [],
            });
            setTimeout(() => navigate('/patients'), 2000); 
        } catch (err) {
            console.error('Error adding patient:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to add patient.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Add New Patient
            </Typography>
            {success && <Alert severity="success" sx={{ mb: 2 }}>Patient added successfully!</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            label="Patient ID"
                            name="patientId"
                            value={formData.patientId}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            label="First Name"
                            name="name.firstName"
                            value={formData.name.firstName}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            label="Last Name"
                            name="name.lastName"
                            value={formData.name.lastName}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            label="Date of Birth"
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            select
                            label="Gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            label="Phone"
                            name="contact.phone"
                            value={formData.contact.phone}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Email"
                            name="contact.email"
                            type="email"
                            value={formData.contact.email}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 1 }}>Address</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Street"
                            name="address.street"
                            value={formData.address.street}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="City"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="State"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Zip Code"
                            name="address.zipCode"
                            value={formData.address.zipCode}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Blood Group"
                            name="bloodGroup"
                            value={formData.bloodGroup}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Allergies (comma-separated)"
                            name="allergies"
                            value={formData.allergies.join(', ')}
                            onChange={(e) => handleArrayChange(e, 'allergies')}
                            fullWidth
                            variant="outlined"
                            helperText="e.g., Penicillin, Peanuts"
                        />
                    </Grid>
                    {}
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={loading}
                            sx={{ py: 1.5 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Patient'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}

export default AddPatient;