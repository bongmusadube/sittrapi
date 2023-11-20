const { Router } = require('express');
const controller = require('../user/controller');

const router = Router();


router.get('/', controller.getAllBookings);
router.get('/:bookingId', controller.getBookingById);
router.post('/', controller.createBooking);
router.get('/user/:user_email', controller.getBookingsByUserEmail);
router.get('/caregiver/:caregiver_email', controller.getBookingsByCaregiverEmail);
router.patch('/:bookingId', controller.updateBookingStatus);
router.patch('/:bookingId/complete', controller.completeBooking);
router.patch('/review/:bookingId', controller.updateBookingReview);
module.exports = router;
