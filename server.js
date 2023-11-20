const express = require('express');
const path = require('path');
const userRouter = require('./src/user/routes');
const caregiverRouter = require('./src/caregiver/caregiverRoutes'); 
const bookingRouter = require('./src/booking/bookingRoutes');
const allUsersRouter = require('./src/all users/allUsersRouter');
const adminRouters = require('./src/admin/adminRoutes');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json()); 
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
    res.send('Welcome to Sittr API');
})

app.use(express.json({ limit: '500000mb' }));
app.use(express.urlencoded({ limit: '500000mb', extended: true }));
app.use('/api/v1/users', userRouter); 
app.use('/api/v1/caregivers', caregiverRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/allusers', allUsersRouter);
app.use('/api/v1/admins', adminRouters);
app.listen(port, ()=> {
    console.log('Server is running on port '+ port);
})

