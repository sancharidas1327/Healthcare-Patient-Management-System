import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Pagination,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import patientService from '../services/patientService';
import { Search, Clear, Sort } from '@mui/icons-material';

function PatientList() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchFilters, setSearchFilters] = useState({
        patientId: '',
        firstName: '',
        lastName: '',
        condition: '',
        visitDate: '',
    });
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [sort, setSort] = useState('name.lastName');
    const [order, setOrder] = useState('asc'); // 'asc' or 'desc'
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState(null);
    const openSortMenu = Boolean(anchorEl);

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await patientService.getAllPatients(page, limit, sort, order);
            setPatients(res.data.patients);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error('Error fetching patients:', err);
            setError('Failed to fetch patients.');
        } finally {
            setLoading(false);
        }
    }, [page, limit, sort, order]);

    const handleSearch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = {
                query: searchTerm,
                ...searchFilters,
                page: 1,
                limit,
            };
            Object.keys(queryParams).forEach(key => {
                if (!queryParams[key]) {
                    delete queryParams[key];
                }
            });

            const res = await patientService.searchPatients(queryParams);
            setPatients(res.data.patients);
            setTotalPages(res.data.totalPages);
            setPage(1);
        } catch (err) {
            console.error('Error searching patients:', err);
            setError('Failed to search patients.');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, searchFilters, limit]);

    useEffect(() => {
        const hasSpecificFilters = Object.values(searchFilters).some(filter => filter !== '');
        if (searchTerm || hasSpecificFilters) {
            handleSearch();
        } else {
            fetchPatients();
        }
    }, [fetchPatients, handleSearch, searchTerm, searchFilters]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSearchFilters({
            patientId: '',
            firstName: '',
            lastName: '',
            condition: '',
            visitDate: '',
        });
        setPage(1);
    };

    const handleSortClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSortClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (newSort, newOrder) => {
        setSort(newSort);
        setOrder(newOrder);
        setAnchorEl(null);
    };

    if (loading) return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Patient Directory
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    label="General Search (Name, ID, Condition)"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                {searchTerm && (
                                    <IconButton onClick={() => setSearchTerm('')} edge="end">
                                        <Clear />
                                    </IconButton>
                                )}
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    label="Patient ID"
                    variant="outlined"
                    value={searchFilters.patientId}
                    onChange={(e) => setSearchFilters({ ...searchFilters, patientId: e.target.value })}
                />
                <TextField
                    label="First Name"
                    variant="outlined"
                    value={searchFilters.firstName}
                    onChange={(e) => setSearchFilters({ ...searchFilters, firstName: e.target.value })}
                />
                <TextField
                    label="Last Name"
                    variant="outlined"
                    value={searchFilters.lastName}
                    onChange={(e) => setSearchFilters({ ...searchFilters, lastName: e.target.value })}
                />
                <TextField
                    label="Condition"
                    variant="outlined"
                    value={searchFilters.condition}
                    onChange={(e) => setSearchFilters({ ...searchFilters, condition: e.target.value })}
                />
                <TextField
                    label="Visit Date"
                    type="date"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={searchFilters.visitDate}
                    onChange={(e) => setSearchFilters({ ...searchFilters, visitDate: e.target.value })}
                />
                <Button variant="contained" onClick={handleSearch} startIcon={<Search />}>
                    Search
                </Button>
                <Button variant="outlined" onClick={handleClearSearch} startIcon={<Clear />}>
                    Clear Filters
                </Button>
                <Button
                    variant="outlined"
                    onClick={handleSortClick}
                    startIcon={<Sort />}
                >
                    Sort
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={openSortMenu}
                    onClose={handleSortClose}
                >
                    <MenuItem onClick={() => handleMenuItemClick('name.lastName', 'asc')}>Last Name (A-Z)</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('name.lastName', 'desc')}>Last Name (Z-A)</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('age', 'asc')}>Age (Asc)</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('age', 'desc')}>Age (Desc)</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('createdAt', 'desc')}>Newest First</MenuItem>
                </Menu>
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="patient table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Patient ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Age</TableCell>
                            <TableCell>Gender</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {patients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No patients found.</TableCell>
                            </TableRow>
                        ) : (
                            patients.map((patient) => (
                                <TableRow key={patient._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">
                                        {patient.patientId}
                                    </TableCell>
                                    <TableCell>{`${patient.name?.firstName || ''} ${patient.name?.lastName || ''}`}</TableCell>
                                    <TableCell>{patient.age}</TableCell>
                                    <TableCell>{patient.gender}</TableCell>
                                    {/* FIX: Add optional chaining and fallback for contact and phone */}
                                    <TableCell>{patient.contact?.phone || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => navigate(`/patients/${patient._id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    disabled={loading}
                />
            </Box>
        </Container>
    );
}

export default PatientList;
