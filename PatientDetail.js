import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    CircularProgress,
    Alert,
    Paper,
    Grid,
    Tab,
    Tabs,
    TextField,
    Divider,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    List, ListItem, ListItemText,
    MenuItem 
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import patientService from '../services/patientService';
import moment from 'moment';
import { Edit, Delete, AddCircleOutline } from '@mui/icons-material';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}
function PatientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const fetchPatient = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await patientService.getPatientById(id);
            setPatient(res.data);
            setEditFormData(res.data); 
        } catch (err) {
            console.error('Error fetching patient:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to fetch patient details.');
        } finally {
            setLoading(false);
        }
    }, [id]);
    useEffect(() => {
        fetchPatient();
    }, [fetchPatient]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setEditFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setEditFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };
    const handleArrayChange = (e, fieldName) => {
        const { value } = e.target;
        setEditFormData((prev) => ({
            ...prev,
            [fieldName]: value.split(',').map((item) => item.trim()).filter(item => item),
        }));
    };
    const handleUpdate = async () => {
        setLoading(true);
        setError(null);
        try {
            const dataToUpdate = {
                ...editFormData,
                dateOfBirth: moment(editFormData.dateOfBirth).toISOString(),
            };
            const res = await patientService.updatePatient(id, dataToUpdate);
            setPatient(res.data);
            setIsEditing(false);
            setLoading(false);
        } catch (err) {
            console.error('Error updating patient:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to update patient.');
            setLoading(false);
        }
    };
    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            await patientService.deletePatient(id);
            setOpenDeleteDialog(false);
            navigate('/patients'); 
        } catch (err) {
            console.error('Error deleting patient:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to delete patient.');
        } finally {
            setLoading(false);
        }
    };
    const handleAddNewEmbeddedItem = async (fieldName, newItem) => {
        setLoading(true);
        setError(null);
        try {
            const updatePayload = {};
            updatePayload[`new${fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/s$/, '')}`] = newItem;
            const res = await patientService.updatePatient(id, updatePayload);
            setPatient(res.data); 
        } catch (err) {
            console.error(`Error adding new ${fieldName} entry:`, err.response?.data || err.message);
            setError(`Failed to add new ${fieldName} entry.`);
        } finally {
            setLoading(false);
        }
    };
    if (loading && !patient) return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!patient) return <Alert severity="info">Patient not found.</Alert>;
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        {patient.name.firstName} {patient.name.lastName} ({patient.patientId})
                    </Typography>
                    <Box>
                        {!isEditing ? (
                            <Button
                                variant="outlined"
                                startIcon={<Edit />}
                                onClick={() => setIsEditing(true)}
                                sx={{ mr: 1 }}
                            >
                                Edit
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="contained"
                                    onClick={handleUpdate}
                                    sx={{ mr: 1 }}
                                >
                                    Save
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditFormData(patient); // Revert changes
                                    }}
                                >
                                    Cancel
                                </Button>
                            </>
                        )}
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => setOpenDeleteDialog(true)}
                            sx={{ ml: 1 }}
                        >
                            Delete
                        </Button>
                    </Box>
                </Box>

                <Tabs value={tabValue} onChange={handleTabChange} aria-label="patient details tabs" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Personal Info" />
                    <Tab label="Medical History" />
                    <Tab label="Prescriptions" />
                    <Tab label="Visits" />
                    <Tab label="Doctor Notes" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="First Name"
                                name="name.firstName"
                                value={isEditing ? editFormData.name.firstName : patient.name.firstName}
                                onChange={handleEditChange}
                                fullWidth
                                disabled={!isEditing}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Last Name"
                                name="name.lastName"
                                value={isEditing ? editFormData.name.lastName : patient.name.lastName}
                                onChange={handleEditChange}
                                fullWidth
                                disabled={!isEditing}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Date of Birth"
                                type="date"
                                name="dateOfBirth"
                                value={isEditing ? moment(editFormData.dateOfBirth).format('YYYY-MM-DD') : moment(patient.dateOfBirth).format('YYYY-MM-DD')}
                                onChange={handleEditChange}
                                fullWidth
                                disabled={!isEditing}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Age"
                                value={patient.age} 
                                fullWidth
                                disabled
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Gender"
                                name="gender"
                                value={isEditing ? editFormData.gender : patient.gender}
                                onChange={handleEditChange}
                                fullWidth
                                disabled={!isEditing}
                                select
                                variant="outlined"
                            >
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Phone"
                                name="contact.phone"
                                value={isEditing ? editFormData.contact.phone : patient.contact.phone}
                                onChange={handleEditChange}
                                fullWidth
                                disabled={!isEditing}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Email"
                                name="contact.email"
                                value={isEditing ? editFormData.contact.email : patient.contact.email}
                                onChange={handleEditChange}
                                fullWidth
                                disabled={!isEditing}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Allergies (comma-separated)"
                                name="allergies"
                                value={isEditing ? editFormData.allergies.join(', ') : patient.allergies.join(', ')}
                                onChange={(e) => handleArrayChange(e, 'allergies')}
                                fullWidth
                                disabled={!isEditing}
                                variant="outlined"
                                helperText="e.g., Penicillin, Peanuts"
                            />
                        </Grid>
                        {}
                    </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" gutterBottom>Medical History</Typography>
                    <List>
                        {patient.medicalHistory.length === 0 && <Typography>No medical history recorded.</Typography>}
                        {patient.medicalHistory.map((entry, index) => (
                            <ListItem key={entry._id || index}>
                                <ListItemText
                                    primary={`${moment(entry.date).format('YYYY-MM-DD')}: ${entry.condition}`}
                                    secondary={`Notes: ${entry.notes || 'N/A'} - Diagnosed By: ${entry.diagnosedBy || 'N/A'}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                    {isEditing && (
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<AddCircleOutline />}
                                onClick={() => {
                                    const newEntry = {
                                        date: new Date(),
                                        condition: prompt("Enter new condition:"),
                                        notes: prompt("Enter notes (optional):"),
                                        diagnosedBy: prompt("Diagnosed by (optional):")
                                    };
                                    if (newEntry.condition) {
                                        handleAddNewEmbeddedItem('medicalHistory', newEntry);
                                    }
                                }}
                            >
                                Add Medical History Entry
                            </Button>
                        </Box>
                    )}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Typography variant="h6" gutterBottom>Current Prescriptions</Typography>
                    <List>
                        {patient.currentPrescriptions.length === 0 && <Typography>No current prescriptions.</Typography>}
                        {patient.currentPrescriptions.map((p, index) => (
                            <ListItem key={p._id || index}>
                                <ListItemText
                                    primary={`${p.medicationName} - ${p.dosage} (${p.frequency})`}
                                    secondary={`Start: ${moment(p.startDate).format('YYYY-MM-DD')} | End: ${p.endDate ? moment(p.endDate).format('YYYY-MM-DD') : 'Ongoing'} | Notes: ${p.notes || 'N/A'}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                    {isEditing && (
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<AddCircleOutline />}
                                onClick={() => {
                                    const newPrescription = {
                                        medicationName: prompt("Medication Name:"),
                                        dosage: prompt("Dosage:"),
                                        frequency: prompt("Frequency:")
                                    };
                                    if (newPrescription.medicationName) {
                                        handleAddNewEmbeddedItem('currentPrescriptions', newPrescription);
                                    }
                                }}
                            >
                                Add New Prescription
                            </Button>
                        </Box>
                    )}
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    <Typography variant="h6" gutterBottom>Patient Visits</Typography>
                    <List>
                        {patient.visits.length === 0 && <Typography>No visit records.</Typography>}
                        {patient.visits.map((visit, index) => (
                            <ListItem key={visit._id || index}>
                                <ListItemText
                                    primary={`Visit Date: ${moment(visit.visitDate).format('YYYY-MM-DD')} - Doctor: ${visit.doctorName}`}
                                    secondary={`Diagnosis: ${visit.diagnosis} | Notes: ${visit.notes || 'N/A'}`}
                                />
                                {visit.attachments && visit.attachments.length > 0 && (
                                    <Typography variant="caption" sx={{ ml: 2 }}>
                                        ({visit.attachments.length} attachments)
                                    </Typography>
                                )}
                            </ListItem>
                        ))}
                    </List>
                    {isEditing && (
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<AddCircleOutline />}
                                onClick={() => {
                                    const newVisit = {
                                        visitDate: new Date(),
                                        doctorName: prompt("Doctor's Name:"),
                                        diagnosis: prompt("Diagnosis:")
                                    };
                                    if (newVisit.doctorName && newVisit.diagnosis) {
                                        handleAddNewEmbeddedItem('visits', newVisit);
                                    }
                                }}
                            >
                                Add New Visit
                            </Button>
                        </Box>
                    )}
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
                    <Typography variant="h6" gutterBottom>Doctor Notes</Typography>
                    <List>
                        {patient.doctorNotes.length === 0 && <Typography>No doctor notes.</Typography>}
                        {patient.doctorNotes.map((note, index) => (
                            <ListItem key={note._id || index}>
                                <ListItemText
                                    primary={`${moment(note.date).format('YYYY-MM-DD')}: ${note.note}`}
                                    secondary={`Recorded By: ${note.recordedBy || 'N/A'}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                    {isEditing && (
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<AddCircleOutline />}
                                onClick={() => {
                                    const newNote = {
                                        date: new Date(),
                                        note: prompt("Enter new doctor note:"),
                                        recordedBy: 'Current User' 
                                    };
                                    if (newNote.note) {
                                        handleAddNewEmbeddedItem('doctorNotes', newNote);
                                    }
                                }}
                            >
                                Add New Doctor Note
                            </Button>
                        </Box>
                    )}
                </TabPanel>

                <Dialog
                    open={openDeleteDialog}
                    onClose={() => setOpenDeleteDialog(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to delete this patient record? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                        <Button onClick={handleDelete} color="error" autoFocus>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
}

export default PatientDetail;