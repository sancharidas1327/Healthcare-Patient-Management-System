import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Paper,
    Grid,
} from '@mui/material';
import patientService from '../services/patientService';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function AnalyticsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await patientService.getAnalytics();
                setAnalytics(res.data);
                console.log('Fetched Analytics Data:', res.data);
            } catch (err) {
                console.error('Error fetching analytics:', err.response?.data || err.message);
                setError('Failed to fetch analytics data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!analytics) return <Alert severity="info">No analytics data available. Please add some patient records.</Alert>;
    const patientsPerConditionData = {
        labels: analytics.patientsPerCondition?.map(item => item._id || 'Unknown') || [],
        datasets: [{
            label: 'Number of Patients',
            data: analytics.patientsPerCondition?.map(item => item.count) || [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }],
    };

    const mostPrescribedMedicationsData = {
        labels: analytics.mostPrescribedMedications?.map(item => item._id || 'Unknown') || [],
        datasets: [{
            label: 'Prescription Count',
            data: analytics.mostPrescribedMedications?.map(item => item.count) || [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
        }],
    };

    const avgAgePerGenderData = {
        labels: analytics.avgAgePerGender?.map(item => item._id || 'N/A') || [],
        datasets: [{
            label: 'Average Age',
            data: analytics.avgAgePerGender?.map(item => (item.averageAge !== null && item.averageAge !== undefined) ? item.averageAge.toFixed(1) : 0) || [],
            backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(201, 203, 207, 0.6)',
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(201, 203, 207, 1)',
            ],
            borderWidth: 1,
        }],
    };
    const visitsPerMonthData = {
        labels: analytics.visitsPerMonth?.map(item => `${item._id.month}/${item._id.year}`) || [],
        datasets: [{
            label: 'Number of Visits',
            data: analytics.visitsPerMonth?.map(item => item.count) || [],
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
        }],
    };
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Chart Title',
            },
        },
    };
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Healthcare Analytics
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Patients Per Condition</Typography>
                        <Bar options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Patients Per Condition' } } }} data={patientsPerConditionData} />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Most Prescribed Medications (Top 10)</Typography>
                        <Bar options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Most Prescribed Medications' } } }} data={mostPrescribedMedicationsData} />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Average Patient Age Per Gender</Typography>
                        <Pie options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Average Age Per Gender' } } }} data={avgAgePerGenderData} />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Frequency of Visits Per Month (Last 12 Months)</Typography>
                        <Bar options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Visits Per Month' } } }} data={visitsPerMonthData} />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default AnalyticsPage;
