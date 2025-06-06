const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.post('/', patientController.addPatient); 
router.get('/', patientController.getAllPatients);
router.get('/search', patientController.searchPatients);
router.get('/analytics', patientController.getAnalytics);
router.get('/:id', patientController.getPatientById);
router.put('/:id', patientController.updatePatient); 
router.delete('/:id', patientController.deletePatient); 

module.exports = router;