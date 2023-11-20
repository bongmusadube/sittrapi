const { Router } = require('express');
const controller = require('../user/controller');
const multer = require('multer');
const path = require('path');



const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './images'); // Store uploaded images in the 'images' folder
    },
    filename: function (req, file, cb) {
        // Generate a unique filename for the uploaded image with the .jpg extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.fieldname + '-' + uniqueSuffix + '.jpg';
        cb(null, filename);
      }
  });

  const upload = multer({ storage: storage });
  router.post('/upload', upload.single('image'), controller.uploadImage);
  router.post('/upload', upload.single('idDocument'), controller.uploadImage);
  router.post('/upload', upload.single('policeClearance'), controller.uploadImage);
  router.post('/upload', upload.single('profilePicture'), controller.uploadImage);
  router.post('/login', controller.loginAllUsers);
  router.get('/images/:filename', (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../../images', filename);
  
    // Use the res.sendFile function to send the image file
    res.sendFile(imagePath);
  });

  
//Messaging
router.post('/send-message', controller.sendMessage);
router.get('/get-messages/:userEmail/:caregiverEmail', controller.getMessages);






module.exports = router;
