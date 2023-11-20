const getUsers = 'SELECT * FROM users';
const getUserById = `SELECT * FROM users WHERE id = $1`;
const getUserByEmail = 'SELECT * FROM users WHERE email = $1'; 
const checkEmailExists = 'SELECT u FROM users  u WHERE u.email = $1';
const createUser = 'INSERT INTO users (fullname, email, password, dob, gender, contactno, language, location, race) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
const getUserByEmailAndPassword = 'SELECT * FROM users WHERE email = $1 AND password = $2';
const loginUser = 'SELECT * FROM users WHERE email = $1 AND password = $2 OR  SELECT * FROM caregivers WHERE email = $1 AND password = $2';
const deleteUser = 'DELETE FROM users WHERE email = $1';
const updateUser = 'UPDATE users SET fullname = $1 WHERE email = $2';
const getAllCaregivers = 'SELECT * FROM caregivers';
const getCaregiverByEmail = 'SELECT * FROM caregivers WHERE email = $1';


//Admin side queries
const getCaregiversNotApproved='SELECT id,fullname,email,profile_picture_url,id_url,police_clearance_url FROM caregivers WHERE approved=false ';
const getCaregiversApproved='SELECT id,fullname,email,profile_picture_url FROM caregivers WHERE approved=true ';
const getAllparents='SELECT fullname,email FROM users';
const getCaregiverbyId=`SELECT profile_picture_url,fullname,email,approved FROM caregivers WHERE id=$1`;
const loginAdmin ='SELECT id,fullname,email FROM admin WHERE email = $1 AND password = $2';
const declineCaregiver ='INSERT  INTO notapproved (careid,comment) VALUES ($1,$2)';
const getAdmin ='SELECT fullname,email,profile_picture_url FROM admin WHERE id = $1';
//End of admin side queries

// const createCaregiver = `
//   INSERT INTO caregivers (
//     fullname,
//     email,
//     password,
//     date_of_birth,
//     gender,
//     contact_number,
//     language,
//     location,
//     hourly_rate,
//     years_of_experience,
//     rating,
//     image_url,
//     working_hours,
//     approved,
//     booked
//   ) VALUES (
//     $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
//   ) RETURNING *
// `;

const createCaregiver = `
  INSERT INTO caregivers (
    fullname,
    email,
    password,
    date_of_birth,
    gender,
    contact_number,
    language,
    location,
    hourly_rate,
    years_of_experience,
    start_time,
    end_time,
    id_number,
    id_url,
    police_clearance_url,
    profile_picture_url,
    working_days,
    bio,
    advertised

   
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,$16, $17, $18, $19
  ) RETURNING *
`;
const getCaregiverByEmailAndPassword = 'SELECT * FROM caregivers WHERE email = $1 AND password = $2';
const getAllBookings = 'SELECT * FROM bookings';
const getBookingsByUserEmail = 'SELECT * FROM bookings WHERE user_email = $1';
const getBookingsByCaregiverEmail = 'SELECT * FROM bookings WHERE caregiver_email = $1';

const createBooking = `
  INSERT INTO bookings (
    user_email, caregiver_email, start_time, end_time, user_homeaddress, total_hours, total_amount, payment_status,
    number_of_kids, transport_needs, special_needs, comments, selected_dates
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
  ) RETURNING *;
`;
const updateBookingStatus = 'UPDATE bookings SET booking_status = $1 WHERE id = $2';
const getBookingById = 'SELECT * FROM bookings WHERE id = $1';
const updateBookingCaregiverComment = 'UPDATE bookings SET caregiver_comment = $1 WHERE id = $2';
const updateBookingReview = `
  UPDATE bookings
  SET caregiver_rating = $1, review_comment = $2
  WHERE id = $3
  RETURNING *;
`;

const getAdvertisedCaregivers = 'SELECT * FROM caregivers WHERE advertised = true';
// const updateCaregiverBookedDates = `
//   UPDATE caregivers
//   SET booked_dates = array_append(booked_dates, $1)
//   WHERE email = $2
//   RETURNING *;
// `;

const updateCaregiverBookedDates = `
  UPDATE caregivers
  SET booked_dates = $1
  WHERE email = $2
  RETURNING *;
`;
const getBookingReviewsByCaregiverEmail = `
  SELECT
    user_email,
    caregiver_rating,
    review_comment,
    created_at
  FROM
    public.bookings
  WHERE
    caregiver_email = $1
    AND caregiver_rating IS NOT NULL
  ORDER BY
    created_at DESC;
`;




module.exports = {
    getUsers,
        getUserById,
        getUserByEmail,
        checkEmailExists,
        createUser,
        deleteUser,
        getUserByEmailAndPassword,
        updateUser, 

      getAllCaregivers,
                getCaregiverByEmail,
                createCaregiver,
                getCaregiverByEmailAndPassword,
                getAllBookings,
                getBookingsByCaregiverEmail,
                createBooking,
                getBookingsByUserEmail,
                loginUser,
                getCaregiversNotApproved,
                getCaregiversApproved,
                getAllparents,
                getCaregiverbyId,
			        	loginAdmin,
			        	declineCaregiver,
				        getAdmin,
                updateBookingStatus,
                getBookingById,
                updateBookingCaregiverComment,
                updateBookingReview,
                getAdvertisedCaregivers,
                updateCaregiverBookedDates,
                getBookingReviewsByCaregiverEmail
}