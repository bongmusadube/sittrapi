const { Router } = require('express');
const controller = require('../user/controller');

const router = Router();

router.get('/notapproved', controller.getAllCareGiversNotApproved);
router.get('/approved', controller.getAllCareGiversApproved);
router.get('/allparents', controller.getAllParents);
router.patch('/approvecaregiver/:id', controller.approveCaregiver);
router.post('/declinecaregiver', controller.DeclineCaregiver);
router.post('/login', controller.LoginAdmin);
router.get('/adminprofile/:id', controller.AdminProfile);
router.get('/caregiverprofile/:id', controller.CaregiverProfile);
router.get('/caregiversmonths', controller.CaregiverMonths);
router.get('/numApproved', controller.NumApproved);
router.get('/numUnApproved', controller.NumUnApproved);
router.get('/numApproved', controller.NumApproved);
router.get('/languageCount', controller.LanguageCount);
router.get('/totalcaregivers', controller.TotalCareGivers);
router.get('/caregiverrating/:caregiver_email', controller.AverageRating);
router.get('/parentlanguages/:caregiver_email', controller.getParentLanguages);
router.get('/caregiverincome/:caregiver_email', controller.getCaregiverIncome);
router.get('/companyincome', controller.getCompanyIncome);
router.get('/caregiverTotalincome/:caregiver_email', controller.getCaregiverTotalIncome);
router.patch('/advertisecaregiver/:id', controller.advertiseCaregiver);

router.post('/messages/send', controller.sendMessage);
router.get('/messages/:userType/:sender_id', controller.getMessages);
router.post('/sendEmail', controller.SendEmail);
router.get('/sentemail/:sender_email', controller.GetSentEmails);
router.get('/receivedemail/:userEmail', controller.GetReceivedEmails);
router.get('/getEmail/:id', controller.GetEmailByID);
router.post('/addtraining/:caregiver_email', controller.ApplyTraining);
router.get('/getAdvertised', controller.getAllAdvertisedCaregivers);
router.get('/searchemail/:careId', controller.SearchCaregiver);
router.get('/caregiverratings', controller.TotalRating);
router.get('/countmessage', controller.MessageCounts);
module.exports = router;
