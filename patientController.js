const Patient = require('../models/Patient');
const mongoose = require('mongoose');
const calculateAge = (dob) => {
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
};
exports.addPatient = async (req, res) => {
    try {
        const {
            patientId,
            name,
            dateOfBirth,
            gender,
            contact,
            address,
            bloodGroup,
            allergies,
            medicalHistory,
            currentPrescriptions,
            visits,
            doctorNotes
        } = req.body;
        // Basic validation
        if (!patientId || !name || !name.firstName || !name.lastName || !dateOfBirth || !gender || !contact || !contact.phone) {
            return res.status(400).json({ message: 'Missing required patient fields.' });
        }
        // Check if patientId already exists
        const existingPatient = await Patient.findOne({ patientId });
        if (existingPatient) {
            return res.status(400).json({ message: 'Patient with this ID already exists.' });
        }
        const age = calculateAge(dateOfBirth);
        const newPatient = new Patient({
            patientId,
            name,
            dateOfBirth,
            age,
            gender,
            contact,
            address,
            bloodGroup,
            allergies,
            medicalHistory: medicalHistory || [],
            currentPrescriptions: currentPrescriptions || [],
            visits: visits || [],
            doctorNotes: doctorNotes || []
        });
        const savedPatient = await newPatient.save();
        res.status(201).json(savedPatient);
    } catch (error) {
        console.error('Error adding patient:', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Patient ID already exists.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAllPatients = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const sort = req.query.sort || 'name.lastName'; // Default sort by last name
        const order = req.query.order === 'desc' ? -1 : 1; // Default ascending
        const patients = await Patient.find({})
            .sort({
                [sort]: order
            })
            .skip(skip)
            .limit(limit);
        const totalPatients = await Patient.countDocuments();
        res.status(200).json({
            patients,
            currentPage: page,
            totalPages: Math.ceil(totalPatients / limit),
            totalPatients
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.searchPatients = async (req, res) => {
    try {
        const {
            query, // General search for name, ID, condition
            patientId,
            firstName,
            lastName,
            condition,
            visitDate,
            page = 1,
            limit = 10
        } = req.query;
        let findQuery = {};
        if (query) {
            // Text search across indexed fields
            findQuery.$text = {
                $search: query
            };
        }
        if (patientId) {
            findQuery.patientId = {
                $regex: patientId,
                $options: 'i'
            }; // Case-insensitive
        }
        if (firstName) {
            findQuery['name.firstName'] = {
                $regex: firstName,
                $options: 'i'
            };
        }
        if (lastName) {
            findQuery['name.lastName'] = {
                $regex: lastName,
                $options: 'i'
            };
        }
        if (condition) {
            // Search in medicalHistory andnin currentPrescriptions
            findQuery.$or = [{
                'medicalHistory.condition': {
                    $regex: condition,
                    $options: 'i'
                }
            }, {
                'currentPrescriptions.medicationName': {
                    $regex: condition,
                    $options: 'i'
                }
            }, ];
        }
        if (visitDate) {
            const date = new Date(visitDate);
            const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            findQuery['visits.visitDate'] = {
                $gte: startOfDay,
                $lt: endOfDay
            };
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const patients = await Patient.find(findQuery)
            .skip(skip)
            .limit(parseInt(limit));
        const totalPatients = await Patient.countDocuments(findQuery);
        res.status(200).json({
            patients,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalPatients / parseInt(limit)),
            totalPatients
        });
    } catch (error) {
        console.error('Error searching patients:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json(patient);
    } catch (error) {
        console.error('Error fetching patient by ID:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid patient ID format.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.dateOfBirth) {
            updateData.age = calculateAge(updateData.dateOfBirth);
        }
        const patient = await Patient.findById(id);

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        if (updateData.newMedicalHistoryEntry) {
            patient.medicalHistory.push(updateData.newMedicalHistoryEntry);
            delete updateData.newMedicalHistoryEntry; // Remove it from the main update
        }
        if (updateData.newPrescription) {
            patient.currentPrescriptions.push(updateData.newPrescription);
            delete updateData.newPrescription;
        }
        if (updateData.newVisit) {
            patient.visits.push(updateData.newVisit);
            delete updateData.newVisit;
        }
        if (updateData.newDoctorNote) {
            patient.doctorNotes.push(updateData.newDoctorNote);
            delete updateData.newDoctorNote;
        }
        Object.assign(patient, updateData);
        patient.markModified('medicalHistory');
        patient.markModified('currentPrescriptions');
        patient.markModified('visits');
        patient.markModified('doctorNotes');


        const updatedPatient = await patient.save(); 

        if (!updatedPatient) {
            return res.status(404).json({ message: 'Patient not found or update failed.' });
        }

        res.status(200).json(updatedPatient);
    } catch (error) {
        console.error('Error updating patient:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid patient ID format.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message, errors: error.errors });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Attempting to delete patient with ID: ${id}`);

        const deletedPatient = await Patient.findByIdAndDelete(id);

        if (!deletedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        console.log(`Patient record deleted: ${deletedPatient.patientId} - ${deletedPatient.fullName}`);

        res.status(200).json({ message: 'Patient record deleted successfully', deletedPatientId: id });
    } catch (error) {
        console.error('Error deleting patient:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid patient ID format.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAnalytics = async (req, res) => {
    try {
        const patientsPerCondition = await Patient.aggregate([
            { $unwind: '$medicalHistory' },
            { $group: { _id: '$medicalHistory.condition', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const mostPrescribedMedications = await Patient.aggregate([
            { $unwind: '$currentPrescriptions' },
            { $group: { _id: '$currentPrescriptions.medicationName', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 } 
        ]);
        const avgAgePerGender = await Patient.aggregate([
            { $group: { _id: '$gender', averageAge: { $avg: '$age' } } },
            { $sort: { _id: 1 } }
        ]);
        const avgAgePerDoctor = await Patient.aggregate([
            { $unwind: '$visits' },
            { $group: { _id: '$visits.doctorName', averageAge: { $avg: '$age' } } },
            { $sort: { averageAge: -1 } }
        ]);
        const visitsPerMonth = await Patient.aggregate([
            { $unwind: '$visits' },
            {
                $match: {
                    'visits.visitDate': {
                        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$visits.visitDate' },
                        month: { $month: '$visits.visitDate' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);


        res.status(200).json({
            patientsPerCondition,
            mostPrescribedMedications,
            avgAgePerGender,
            avgAgePerDoctor,
            visitsPerMonth
        });

    } catch (error) {
        console.error('Error generating analytics:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};