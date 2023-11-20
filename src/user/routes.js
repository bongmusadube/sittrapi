const { Router } = require('express');
const controller = require('./controller');

const router = Router();

router.get('/', controller.getUsers);
router.get('/:email', controller.getUserByEmail);
router.post('/register', controller.registerUser);
router.post('/loginUser', controller.loginAllUsers);
router.post('/login', controller.loginUser); 
router.delete('/:email', controller.deleteUser);
router.put('/:email', controller.updateUser);
router.get('/caregivers', controller.getAllCaregivers);
router.get('/advertised', controller.getAdvertisedCaregivers);
//router.get('/allusers', controller.loginAllUsers);
router.get('/caregivers/:caregiver_email', controller.getCaregiverByEmail);
router.get('/bookings', controller.getAllBookings);
router.get('/bookings/user/:user_email', controller.getBookingsByUserEmail);
router.get('/bookings/caregiver/:caregiver_email', controller.getBookingsByCaregiverEmail);
router.get('/bookings/recent-caregivers/:user_email', controller.getRecentCaregiversForUser);
module.exports = router;
