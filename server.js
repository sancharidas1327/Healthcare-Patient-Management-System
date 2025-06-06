require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected successfully!'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
app.get('/', (req, res) => {
    res.send('Healthcare Patient Management System API is running!');
});
// Import Routes
const patientRoutes = require('./routes/patientRoutes');
const authRoutes = require('./routes/authRoutes');
app.use('/api/patients', patientRoutes);
// only an admin can create new users.
app.use('/api/auth', authRoutes);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
