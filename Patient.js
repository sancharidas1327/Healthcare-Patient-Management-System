const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
    medicationName: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    notes: String
});

const VisitSchema = new mongoose.Schema({
    visitDate: { type: Date, default: Date.now },
    doctorName: { type: String, required: true },
    diagnosis: { type: String, required: true },
    notes: String,
    attachments: [String]
});

const PatientSchema = new mongoose.Schema({
    patientId: { 
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    name: {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true }
    },
    dateOfBirth: { type: Date, required: true },
    age: { type: Number, required: true }, 
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    contact: {
        phone: { type: String, required: true, trim: true },
        email: { type: String, trim: true, lowercase: true, match: /^\S+@\S+\.\S+$/ } 
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    bloodGroup: String,
    allergies: [String],
    medicalHistory: [{ 
        date: { type: Date, default: Date.now },
        condition: { type: String, required: true },
        notes: String,
        diagnosedBy: String
    }],
    currentPrescriptions: [PrescriptionSchema], 
    visits: [VisitSchema], 
    doctorNotes: [{ 
        date: { type: Date, default: Date.now },
        note: { type: String, required: true },
        recordedBy: String 
    }],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

PatientSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

PatientSchema.virtual('fullName').get(function() {
    return `${this.name.firstName} ${this.name.lastName}`;
});

PatientSchema.index({ 'name.firstName': 1, 'name.lastName': 1 }); 
PatientSchema.index({ patientId: 1 }); 
PatientSchema.index({ 'medicalHistory.condition': 1 }); 
PatientSchema.index({ 'visits.visitDate': -1 }); 
PatientSchema.index({ '$**': 'text' }); 
module.exports = mongoose.model('Patient', PatientSchema);