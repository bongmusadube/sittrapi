const { Router } = require('express');
const multer = require('multer');
const caregiverController = require('../user/controller');

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/', // Specify the folder where files will be temporarily stored before processing
});

// Register a new caregiver with file uploads
router.post('/register', upload.fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'policeClearance', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 },
]), caregiverController.registerCaregiver);

router.get('/', caregiverController.getAllCaregivers);
router.get('/:email', caregiverController.getCaregiverByEmail);
router.post('/login', caregiverController.loginCaregiver);
// Add a new route for fetching booking reviews by caregiver email
router.get('/reviews/:caregiverEmail', caregiverController.getBookingReviewsByCaregiverEmail);
router.get('/reviewstats/:email', caregiverController.getReviewStats);

router.get('/advertised', caregiverController.getAdvertisedCaregivers);
router.patch('/update-booked-dates/:caregiverEmail', caregiverController.updateBookedDates);
router.get('/booked-dates/:caregiverEmail', caregiverController.getBookedDatesByCaregiverEmail);

router.post('/send-message', caregiverController.sendMessage);
router.get('/get-messages/:receiverEmail', caregiverController.getMessages);
router.get('/recent-users/:caregiverEmail', caregiverController.getRecentUsersForCaregiver);

// Add more routes for create, update, and delete caregivers as needed

module.exports = router;
