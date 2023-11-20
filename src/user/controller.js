const bcrypt = require('bcrypt');
const pool = require('../../db');
const queries = require('./queries');
const path = require('path');
const fs = require('fs');

const getUsers = (req, res) => {
     pool.query(queries.getUsers, (err, result) => {
             if (err) throw err;
             res.status(200).json(result.rows);
         }); 

};



// const getUserById = (req, res) => { 
    
//     //get id from the url parameter
//     const id = parseInt(req.params.id);

//     pool.query(queries.getUserById, [id], (err, result) => {
//         if (err) throw err;A
//         res.status(200).json(result.rows);
//     });
// };

const getUserByEmail = (req, res) => { 
    
    //get id from the url parameter
    const email = req.params.email;

    pool.query(queries.getUserByEmail, [email], (err, result) => {
        if (err) throw err;
        res.status(200).json(result.rows);
    });
};

//Register User

const registerUser = (req, res) => {
  const {
      fullname,
      email,
      password,
      dob,
      gender,
      contactno,
      language,
      location,
      race,
  } = req.body;

  // Hash the password before storing it in the database
  const saltRounds = 10;

  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
          console.error('Error hashing password:', err);
          res.status(500).send('Error creating user.');
          return;
      }

      pool.query(queries.checkEmailExists, [email], (err, result) => {
          if (err) {
              console.error('Error checking email existence:', err);
              res.status(500).send('Error creating user.');
              return;
          }

          if (result.rows.length > 0) {
              res.status(409).send('Email already exists.');
          } else {
              pool.query(
                  queries.createUser,
                  [
                      fullname,
                      email,
                      hashedPassword, // Store the hashed password in the database
                      dob,
                      gender,
                      contactno,
                      language,
                      location,
                      race,
                  ],
                  (err, result) => {
                      if (err) {
                          console.error('Error creating user:', err);
                          res.status(500).send('Error creating user.');
                      } else {
                          res.status(201).send('User created successfully!');
                      }
                  }
              );
          }
      });
  });
};



const deleteUser = (req, res) => {
    
    //get email from the url parameter
    const email = req.params.email;
    
    pool.query(queries.getUserByEmail, [email], (err, result) => {
        const noUserFond =  !result.rows.length;
        if(noUserFond)
        {
            response.send("User is not found in the database! Could not delete");
        }

        pool.query(queries.deleteUser, [email], (err, result) => {
            if (err) throw err;
            res.status(200).send("User deleted successfully!");
        }); 
        
    }); 
};

const updateUser = (req, res) => {
    const email = req.body.email;
    const {fullname} = req.body.fullname;

    pool.query(queries.getUserByEmail, [email], (err, result) => {
        const noUserFond = !result.rows.length;
        if(noUserFond)
        {
            response.send("User is not found in the database! Could not update");
        } 
        
        pool.query(queries.updateUser, [fullname, email], (err, result) => {
            if (err) throw err;
            res.status(200).send("User updated successfully!");
        });

    });

};


const loginAllUsers = (req, res) => {
  const { email, password } = req.body;

  const query = `
    SELECT
      email,
      password,
      usertype
    FROM public.caregivers
    WHERE email = $1
    UNION ALL
    SELECT
      email,
      password,
      usertype
    FROM public.users
    WHERE email = $2;
  `;

  pool.query(query, [email, email], (err, result) => {
    if (err) {
      console.error('Error fetching user by email:', err);
      res.status(500).send('Error during login.');
    } else {
      if (result.rows.length === 0) {
        res.status(401).send('Invalid email or password.');
      } else {
        const user = result.rows[0];
        bcrypt.compare(password, user.password, (error, isMatch) => {
          if (error) {
            console.error('Error comparing passwords:', error);
            res.status(500).send('Error during login.');
          } else {
            if (isMatch) {
              res.status(200).json({ message: 'Login successful!', user });
            } else {
              res.status(401).send('Invalid email or password.');
            }
          }
        });
      }
    }
  });
};





// LOGIN Function
const loginUser = (req, res) => {
  const { email, password } = req.body;

  pool.query(queries.getUserByEmail, [email], (err, result) => {
    if (err) {
      console.error('Error fetching user by email:', err);
      res.status(500).send('Error during login.');
    } else {
      if (result.rows.length === 0) {
        res.status(401).send('Invalid email or password.');
      } else {
        const user = result.rows[0];
        bcrypt.compare(password, user.password, (error, isMatch) => {
          if (error) {
            console.error('Error comparing passwords:', error);
            res.status(500).send('Error during login.');
          } else {
            if (isMatch) {
              res.status(200).json({ message: 'Login successful!', user });
            } else {
              res.status(401).send('Invalid email or password.');
            }
          }
        });
      }
    }
  });
};

//Admin server side--------------------------------------------------------



const LoginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const query = `
    SELECT 
	id,
    email,
    password,
    usertype
    FROM public.admin
    WHERE email=$1
	  UNION ALL
    SELECT
	id,
      email,
      password,
      usertype
    FROM public.caregivers
    WHERE email = $2;
  `;

  pool.query(query, [email, email], (err, result) => {
    if (err) {
      console.error('Error fetching user by email:', err);
      res.status(500).send('Error during login.');
    } else {
      if (result.rows.length === 0) {
        res.status(401).send('Invalid email or password.');
      } else {
        const user = result.rows[0];
        bcrypt.compare(password, user.password, (error, isMatch) => {
          if (error) {
            console.error('Error comparing passwords:', error);
            res.status(500).send('Error during login.');
          } else {
            if (isMatch) {
              // Respond with only the user object
              res.json(user);
            } else {
              res.status(401).send('Invalid email or password.');
            }
          }
        });
      }
    }
  });
}



const AverageRating = async (req, res) => {
  try {
    const caregiver_email = req.params.caregiver_email;
    const ratingsByMonth = {};

    const { rows } = await pool.query(
      'SELECT caregiver_rating, created_at FROM bookings WHERE caregiver_email = $1',
      [caregiver_email]
    );

    rows.forEach(booking => {
      const date = new Date(booking.created_at);
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
      const monthKey = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      if (!ratingsByMonth[monthKey]) {
        ratingsByMonth[monthKey] = {
          totalRatings: 0,
          totalSum: 0
        };
      }

      ratingsByMonth[monthKey].totalRatings++;
      ratingsByMonth[monthKey].totalSum += booking.caregiver_rating;
    });

    // Generate a list of all months from January to December
    const allMonths = [];
    let totalRatings = 0;
    let totalSum = 0;

    for (let month = 1; month <= 12; month++) {
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2022, month - 1, 1));
      const monthKey = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      const averageRating = ratingsByMonth[monthKey]
        ? (ratingsByMonth[monthKey].totalSum / ratingsByMonth[monthKey].totalRatings).toFixed(1)
        : '0.0';

      totalRatings += ratingsByMonth[monthKey] ? ratingsByMonth[monthKey].totalRatings : 0;
      totalSum += ratingsByMonth[monthKey] ? ratingsByMonth[monthKey].totalSum : 0;

      allMonths.push({
        Month: monthName,
        AverageRating: averageRating
      });
    }

    const totalAverageRating = totalRatings === 0 ? '0' : (totalSum / totalRatings).toFixed(0);

    allMonths.forEach(month => {
      month.TotalAverageRating = totalAverageRating;
    });

    res.json(allMonths);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
};


const getAllParents = (req, res) => {
pool.query(queries.getAllparents, (err, result) => {
 if (err) {
   console.error('Error fetching parents:', err);
   res.status(500).send('Error fetching parents.');
 } else {
   res.status(200).json(result.rows);
 }
});
};

const getParentLanguages = async (req, res) => {
  const caregiverEmail = req.params.caregiver_email;

  try {
    const query = `
      SELECT u.language, COUNT(DISTINCT b.user_email) AS parent_count
      FROM users u
      JOIN bookings b ON u.email = b.user_email
      WHERE b.caregiver_email = $1
      GROUP BY u.language
    `;
    const values = [caregiverEmail];

    const result = await pool.query(query, values);

    const languagesData = result.rows.map(row => ({
      language: row.language,
      parent_count: row.parent_count,
    }));

    res.json(languagesData);
  } catch (error) {
    console.error('Error fetching parent languages:', error);
    res.status(500).send('Error fetching parent languages.');
  }
};

const getCaregiverIncome = async (req, res) => {
  try {
    const caregiverEmail = req.params.caregiver_email;
    const incomeByMonth = {};

    const { rows } = await pool.query(
      'SELECT total_amount, created_at FROM bookings WHERE caregiver_email = $1 AND booking_status = $2',
      [caregiverEmail, 'complete']
    );

    rows.forEach(booking => {
      const date = new Date(booking.created_at);
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
      const monthKey = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      if (!incomeByMonth[monthKey]) {
        incomeByMonth[monthKey] = {
          totalAmount: 0
        };
      }

      incomeByMonth[monthKey].totalAmount += booking.total_amount;
    });

    // Generate a list of all months from January to December
    const allMonths = [];

    for (let month = 1; month <= 12; month++) {
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2023, month - 1, 1));
      const monthKey = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      const totalAmount = incomeByMonth[monthKey] ? incomeByMonth[monthKey].totalAmount : 0;

      allMonths.push({
        Month: monthName,
        TotalAmount: totalAmount
      });
    }

    res.json(allMonths);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
};




const getAllCareGiversNotApproved = (req, res) => {
    pool.query(queries.getCaregiversNotApproved, (err, result) => {
        if (err) {
            console.error('Error fetching not approved caregivers:', err);
            res.status(500).send('Error fetching not approved caregivers.');
        } else {
            // Process the result and generate complete image URLs
         try {
                // Process the result and generate complete image URLs
                const caregiversWithImageUrls = result.rows.map(caregiver => ({
                    ...caregiver,
                    id_url: `${caregiver.id_url}`,
					
                }));

                res.status(200).json(caregiversWithImageUrls);
            } catch (error) {
                console.error('Error processing image URLs:', error);
                res.status(500).send('Error processing image URLs.');
            }
          
        }
    });
};

const getAllAdvertisedCaregivers = async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM caregivers
      WHERE advertised = TRUE
    `;

    const result = await pool.query(query);

    const caregivers = result.rows;

    res.json(caregivers);
  } catch (error) {
    console.error('Error fetching caregivers:', error);
    res.status(500).json({ error: 'An error occurred while fetching caregivers.' });
  }
};


const approveCaregiver = async (req, res) => {
  const { id } = req.params; // Assuming the caregiver ID is passed as a URL parameter

  try {
    // Check if the caregiver ID exists in the database before proceeding
    const checkQuery = `
      SELECT id FROM caregivers
      WHERE id = $1
    `;

    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rowCount === 0) {
      res.status(404).json({ message: 'Caregiver not found.' });
      return; // Return early to avoid proceeding with the update
    }

    // Use the PATCH method to update the caregiver's approval status
    const patchQuery = `
      UPDATE caregivers
      SET approved = TRUE
      WHERE id = $1
    `;

    await pool.query(patchQuery, [id]);

    res.status(200).json({ message: 'Caregiver approval status updated to true.' });
  } catch (error) {
    console.error('Error updating caregiver approval status:', error);
    res.status(500).send('Error updating caregiver approval status.');
  }
};

const advertiseCaregiver = async (req, res) => {
  const { id } = req.params; 

  try {
    // Check if the caregiver ID exists in the database before proceeding
    const checkQuery = `
      SELECT id FROM caregivers
      WHERE id = $1
    `;

    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rowCount === 0) {
      res.status(404).json({ message: 'Caregiver not found.' });
      return; // Return early to avoid proceeding with the update
    }

    // Use the PATCH method to update the caregiver's approval status
    const patchQuery = `
      UPDATE caregivers
      SET advertised = TRUE
      WHERE id = $1
    `;

    await pool.query(patchQuery, [id]);

    res.status(200).json({ message: 'Caregiver approval status updated to true.' });
  } catch (error) {
    console.error('Error updating caregiver approval status:', error);
    res.status(500).send('Error updating caregiver approval status.');
  }
};
const MessageCounts = async (req, res) => {
  try {
    const client = await pool.connect();

    const query = `
      SELECT
        receiver_email,
        COUNT(*) as count,
        TO_CHAR(MAX("timestamp"), 'Month') as month,
        message
      FROM public.messages
      GROUP BY receiver_email, TO_CHAR("timestamp", 'YYYY-MM'), message
      ORDER BY MAX("timestamp");
    `;

    const result = await client.query(query);
    const filteredMessages = result.rows.filter(row => {
      return /Congratulations on becoming the top caregiver.*You've been rewarded with a special Wicode worth R\d{4}: [A-Z]+!.*Enjoy your achievement/.test(row.message);
    });

    const messageCounts = filteredMessages.map(row => ({
      count: filteredMessages.length.toString(),
      repeat_count: filteredMessages.filter(msg => msg.receiver_email === row.receiver_email).length.toString(),
      month: row.month
    }));

    client.release();

    res.status(200).json(messageCounts);
  } catch (error) {
    console.error('Error fetching message counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const DeclineCaregiver = async (req, res) => {
  const { careEmail, comment } = req.body; 

  try {
    const client = await pool.connect();

    
    const query = `
      INSERT INTO notapproved (careEmail, comment)
      VALUES ($1, $2)
      RETURNING *;`;

    const values = [careEmail, comment];

    
    const result = await client.query(query, values);
    const insertedRow = result.rows[0];

    client.release();

    res.status(201).json(insertedRow); 
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const SearchCaregiver = async (req, res) => {
  const careIdToCheck = req.params.careId;

  
  if (!careIdToCheck) {
    return res.status(400).json({ error: 'Missing careId parameter' });
  }

  try {
    const exists = await checkCareIdExists(careIdToCheck);

     if (exists) {
      return res.json(exists);
    } else {
      return res.json(exists);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
 
};

async function checkCareIdExists(careId) {
  try {
    const client = await pool.connect();

    // Use parameterized query to prevent SQL injection
    const query = 'SELECT EXISTS (SELECT 1 FROM notapproved WHERE careid = $1) as "exists"';
    const values = [careId];

    const result = await client.query(query, values);
    const exists = result.rows[0].exists;

    client.release();

    return exists;
  } catch (error) {
    console.error('Error checking careId:', error);
    throw error;
  }
}
const getAllCareGiversApproved = (req, res) => {
    pool.query(queries.getCaregiversApproved, (err, result) => {
        if (err) {
            console.error('Error fetching approved caregivers:', err);
            res.status(500).send('Error fetching approved caregivers.');
        } else {
            try {
                // Process the result and generate complete image URLs
                const caregiversWithImageUrls = result.rows.map(caregiver => ({
                    ...caregiver,
                    profile_picture_url: `${caregiver.profile_picture_url}`
                }));

                res.status(200).json(caregiversWithImageUrls);
            } catch (error) {
                console.error('Error processing image URLs:', error);
                res.status(500).send('Error processing image URLs.');
            }
        }
    });
};




const CaregiverProfile = (req, res) => {
const id = req.params.id;

pool.query(queries.getCaregiverbyId, [id], (err, result) => {
   if (err) {
            console.error('Error fetching approved caregivers:', err);
            res.status(500).send('Error fetching approved caregivers.');
        } else {
            try {
                // Process the result and generate complete image URLs
                const caregiversWithImageUrls = result.rows.map(caregiver => ({
                    ...caregiver,
                    profile_picture_url: `${caregiver.profile_picture_url}`
                }));

                res.status(200).json(caregiversWithImageUrls);
            } catch (error) {
                console.error('Error processing image URLs:', error);
                res.status(500).send('Error processing image URLs.');
            }
        }
});
};


const AdminProfile = (req, res) => {
const id = req.params.id;

pool.query(queries.getAdmin, [id], (err, result) => {
  if (err) {
            console.error('Error fetching approved caregivers:', err);
            res.status(500).send('Error fetching approved caregivers.');
        } else {
            try {
               
               
                const adminWithImageUrls = result.rows.map(admin => ({
                  ...admin,
                  profile_picture_url: `${admin.profile_picture_url}`
              }));
                res.status(200).json(adminWithImageUrls);
            } catch (error) {
                console.error('Error processing image URLs:', error);
                res.status(500).send('Error processing image URLs.');
            }
        }
});
};
//Graphs and tables
const CaregiverMonths = async (req, res) => {
  try {
    const query = `
      SELECT
        to_date(created_at, 'YYYY-MM-DD') AS date
      FROM
        caregivers
    `;

    const result = await pool.query(query);

    // Create an object to store the total counts per month
    const monthlyCounts = {};

    // Loop through the dates and calculate the counts per month
    result.rows.forEach(row => {
      const date = new Date(row.date);
      const month = date.getMonth() + 1; // Note: JavaScript months are 0-indexed

      const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);

      const monthKey = `${month.toString().padStart(2, '0')}`;
      if (!monthlyCounts[monthKey]) {
        monthlyCounts[monthKey] = {
          Month: monthName,
          caregiver_count: 0
        };
      }

      monthlyCounts[monthKey].caregiver_count++;
    });

    // Generate a list of all months from January to December
    const allMonths = [];
    for (let month = 1; month <= 12; month++) {
      const monthKey = `${month.toString().padStart(2, '0')}`;
      allMonths.push({
        Month: monthlyCounts[monthKey] ? monthlyCounts[monthKey].Month : new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2022, month - 1, 1)),
        caregiver_count: (monthlyCounts[monthKey] || { caregiver_count: 0 }).caregiver_count
      });
    }

    res.json(allMonths);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};



const NumApproved= async (req, res) => {
  try {
    const query = 'SELECT COUNT(*) AS count FROM caregivers WHERE approved = true';
    const result = await pool.query(query);
    const count = result.rows[0].count;
    res.json({ count });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};
 const NumUnApproved =async (req, res) => {
  try {
    const query = 'SELECT COUNT(*) AS count FROM caregivers WHERE approved = false';
    const result = await pool.query(query);
    const count = result.rows[0].count;
    res.json({ count });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};


 const LanguageCount =async (req, res) => {
  try {
    const query = `
      SELECT language, COUNT(*) AS caregiver_count
      FROM caregivers
      GROUP BY language;
    `;

    const result = await pool.query(query);
    const languageCounts = result.rows;

    res.json(languageCounts);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

 const TotalCareGivers =async (req, res) => {
  try {
    const query = 'SELECT COUNT(*) AS count FROM caregivers';
    const result = await pool.query(query);
    const count = result.rows[0].count;
    res.json({ count });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const getCompanyIncome= async (req, res) => {
  try {
    const query = `
      SELECT
        SUM(total_amount * 0.1) AS "CompanyIncome"
      FROM
        bookings
      WHERE
        booking_status = 'complete'
    `;

    const result = await pool.query(query);

    const companyIncome = result.rows[0].CompanyIncome; // Format the company income
  const formattedIncome = "R" + companyIncome; 
    res.json({ CompanyIncome: formattedIncome });
  } catch (error) {
    console.error('Error fetching data:', error);
 
    res.status(500).json({ CompanyIncome: '0' });
  }
};

const getCaregiverTotalIncome = async (req, res) => {
  try {
    const caregiverEmail = req.params.caregiver_email;

    // Check if the caregiver exists
    const checkQuery = `
      SELECT
        COUNT(*) AS "rowCount"
      FROM
        caregivers
      WHERE
        email = $1
    `;

    const checkResult = await pool.query(checkQuery, [caregiverEmail]);

    if (checkResult.rows[0].rowCount === '0') {
      // Caregiver does not exist, return an error response
      return res.status(404).json({ error: 'Caregiver not found' });
    }

    // If the caregiver exists, proceed with calculating income
    const incomeQuery = `
      SELECT
        SUM(total_amount * 0.9) AS "CaregiverIncome"
      FROM
        bookings
      WHERE
        booking_status = 'complete' AND caregiver_email = $1
    `;

    const incomeResult = await pool.query(incomeQuery, [caregiverEmail]);

    if (incomeResult.rows[0].CaregiverIncome === null) {
      // Handle the case where there are no completed bookings
      res.json({ CaregiverIncome: "R0.00" });
    } else {
      const caregiverIncome = incomeResult.rows[0].CaregiverIncome;
      const formattedIncome = "R" + caregiverIncome.toFixed(2);
      res.json({ CaregiverIncome: formattedIncome });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
};





const getUsersByEmail = async (email) => {
  const caregiverQuery = 'SELECT * FROM caregivers WHERE email = $1';
  const adminQuery = 'SELECT * FROM admin WHERE email = $1';

  const caregiverResult = await client.query(caregiverQuery, [email]);
  if (caregiverResult.rows.length > 0) {
    return caregiverResult.rows[0];
  }

  const adminResult = await client.query(adminQuery, [email]);
  if (adminResult.rows.length > 0) {
    return adminResult.rows[0];
  }

  return null; // User not found
};

const SendEmail = async (req, res) => {
  try {
    const { senderEmail, recipientEmail, message } = req.body;

    // Check if sender and recipient emails exist in the messages table
    const senderExistsQuery = `
      SELECT id
      FROM public.messages
      WHERE receiver_email = $1
    `;
    const senderExistsValues = [senderEmail];
    const senderResult = await pool.query(senderExistsQuery, senderExistsValues);

    const recipientExistsQuery = `
      SELECT id
      FROM public.messages
      WHERE receiver_email = $1
    `;
    const recipientExistsValues = [recipientEmail];
    const recipientResult = await pool.query(recipientExistsQuery, recipientExistsValues);

    if (senderResult.rows.length === 0 || recipientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sender or recipient email not found in messages table' });
    }

    // Insert the email into the database
    const insertEmailQuery = `
      INSERT INTO public.messages (sender_email, receiver_email, message)
      VALUES ($1, $2, $3)
    `;
    const insertEmailValues = [senderEmail, recipientEmail, message];
    await pool.query(insertEmailQuery, insertEmailValues);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const GetSentEmails = async (req, res) => {
  try {
    const { sender_email } = req.params;

    const query = `
      SELECT id, sender_email, receiver_email AS recipient_email, null AS subject, message, "timestamp" AS sent_at
      FROM public.messages
      WHERE sender_email = $1
      ORDER BY "timestamp" DESC
    `;
    const values = [sender_email];

    const client = await pool.connect();
    const result = await client.query(query, values);

    // Release the client back to the pool
    client.release();

    // Check if there are any results
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'No sent emails found.' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving emails:', error);
    res.status(500).json({ success: false, error: 'An error occurred while retrieving emails.' });
  }
};
const GetReceivedEmails = async (req, res) => {
  try {
    const { userEmail } = req.params;

    const query = `
      SELECT id, sender_email, receiver_email AS recipient_email, null AS subject, message, "timestamp" AS sent_at
      FROM public.messages
      WHERE receiver_email = $1
      ORDER BY "timestamp" DESC
    `;
    const values = [userEmail];

    const client = await pool.connect();
    const result = await client.query(query, values);

    // Release the client back to the pool
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving emails:', error);
    res.status(500).json({ success: false, error: 'An error occurred while retrieving emails.' });
  }
};


const GetEmailByID = async (req, res) => {
  const { id } = req.params; 

  try {
   
   const query = `
      SELECT  sender_email,recipient_email, subject, message, sent_at
      FROM emails
      WHERE id = $1
    `;

   
    const values = [id];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
   
  } catch (error) {
    console.error('Error getting email:', error);
   
  }
};


const ApplyTraining = async (req, res) => {
   try {
    const caregiver_email = req.params.caregiver_email;


    const insertQuery = 'INSERT INTO Trainings (caregiver_email) VALUES ($1) RETURNING *';
    const values = [caregiver_email];

    const result = await pool.query(insertQuery, values);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error adding training:', error);
    res.status(500).json({ success: false, error: 'An error occurred while adding the training.' });
  }
};
const TotalRating = async (req, res) => {
  try {
    // SQL query to get ratings for all caregivers along with their profile_picture_url, fullname, and caregiver ID,
    // and rank them based on average_ratings, total_rating, and first_rating_created_at
    const query = `
     SELECT
        caregiver.id AS caregiver_id,
        caregiver.email AS caregiver_email,
        caregiver.profile_picture_url AS caregiver_profile_picture_url,
        caregiver.fullname AS caregiver_fullname,
        COUNT(bookings.caregiver_rating) AS total_rating,
        SUM(bookings.caregiver_rating) AS sum_ratings,
        (
            SELECT MIN(b.created_at)
            FROM bookings AS b
            WHERE b.caregiver_email = caregiver.email
                AND b.caregiver_rating IS NOT NULL
        ) AS first_rating_created_at
    FROM
        caregivers AS caregiver
    LEFT JOIN
        bookings ON caregiver.email = bookings.caregiver_email
    WHERE
        bookings.caregiver_rating IS NOT NULL
    GROUP BY
        caregiver.id, caregiver.email, caregiver.profile_picture_url, caregiver.fullname
    ORDER BY
        ROUND(SUM(bookings.caregiver_rating) / COUNT(bookings.caregiver_rating)) DESC,
        COUNT(bookings.caregiver_rating) ASC,
        (
            SELECT MIN(b.created_at)
            FROM bookings AS b
            WHERE b.caregiver_email = caregiver.email
                AND b.caregiver_rating IS NOT NULL
        ) ASC;
    `;

    const result = await pool.query(query);

    // Prepare an array to store ratings for all caregivers
    const caregiversRatings = result.rows.map(row => ({
      Id: row.caregiver_id,
      caregiver_email: row.caregiver_email,
      caregiver_profile_picture_url: `${row.caregiver_profile_picture_url}`,
      caregiver_fullname: row.caregiver_fullname,
      total_rating: row.total_rating,
      average_ratings: Math.round(row.sum_ratings / row.total_rating),
      first_rating_created_at: row.first_rating_created_at,
    }));

    res.json(caregiversRatings);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//End of Admin server side--------------------------------------------------------


const getAllCaregivers = (req, res) => {
    pool.query(queries.getAllCaregivers, (err, result) => {
      if (err) {
        console.error('Error fetching caregivers:', err);
        res.status(500).send('Error fetching caregivers.');
      } else {
        res.status(200).json(result.rows);
      }
    });
  };

  const getCaregiverByEmail = (req, res) => {
    const email = req.params.email;
  
    pool.query(queries.getCaregiverByEmail, [email], (err, result) => {
      if (err) {
        console.error('Error fetching caregiver by email:', err);
        res.status(500).send('Error fetching caregiver by email.');
      } else {
        if (result.rows.length === 0) {
          res.status(404).send('Caregiver not found.');
        } else {
          res.status(200).json(result.rows[0]);
        }
      }
    });
  };

  


  //Caregiver Login and Registration
  
  const registerCaregiver = async (req, res) => {
    const {

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
      
 
    } = req.body;


  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const caregiver = await pool.query(
        queries.createCaregiver,
        [
          fullname,
      email,
      hashedPassword,
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

        ]
      );
  
      res.status(201).json({ message: 'Caregiver created successfully!', caregiver: caregiver.rows[0] });
    } catch (error) {
      console.error('Error creating caregiver:', error);
      res.status(500).send('Error creating caregiver.');
    }
  };

 
  const loginCaregiver = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const caregiver = await pool.query(queries.getCaregiverByEmail, [email]);
  
      if (caregiver.rows.length === 0) {
        return res.status(401).send('Invalid email or password.');
      }
  
      const isMatch = await bcrypt.compare(password, caregiver.rows[0].password);
  
      if (!isMatch) {
        return res.status(401).send('Invalid email or password.');
      }
  
      res.status(200).json({ message: 'Login successful!', caregiver: caregiver.rows[0] });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send('Error during login.');
    }
  };

const updateBookedDates = (req, res) => {
  const caregiverEmail = req.params.caregiverEmail;
  const { selectedDates } = req.body; // Assuming selectedDates is an array of date strings

  // Fetch the current booked_dates array for the caregiver
  pool.query(queries.getCaregiverByEmail, [caregiverEmail], (err, result) => {
    if (err) {
      console.error('Error fetching caregiver:', err);
      res.status(500).send('Error fetching caregiver.');
    } else {
      if (result.rows.length === 0) {
        res.status(404).send('Caregiver not found.');
      } else {
        const caregiver = result.rows[0];
        let currentBookedDates = caregiver.booked_dates || []; // Initialize as an empty array if it's null

        // Iterate through the new selectedDates and add them if not already present
        selectedDates.forEach(date => {
          if (!currentBookedDates.includes(date)) {
            currentBookedDates.push(date);
          }
        });

        // Remove duplicates from the updated array
        currentBookedDates = Array.from(new Set(currentBookedDates));

        // Convert the updated array to JSON format
        const jsonBookedDates = JSON.stringify(currentBookedDates);

        // Update the caregiver's booked_dates field
        pool.query(queries.updateCaregiverBookedDates, [jsonBookedDates, caregiverEmail], (updateErr, updateResult) => {
          if (updateErr) {
            console.error('Error updating caregiver booked_dates:', updateErr);
            res.status(500).send('Error updating caregiver booked_dates.');
          } else {
            res.status(200).json({ message: 'Caregiver booked_dates updated successfully!', caregiver: updateResult.rows[0] });
          }
        });
      }
    }
  });
};



const getBookedDatesByCaregiverEmail = (req, res) => {
  const caregiverEmail = req.params.caregiverEmail;

  // Fetch the booked dates for the caregiver from the database
  pool.query(queries.getCaregiverByEmail, [caregiverEmail], (err, result) => {
    if (err) {
      console.error('Error fetching caregiver:', err);
      res.status(500).send('Error fetching caregiver.');
    } else {
      if (result.rows.length === 0) {
        res.status(404).send('Caregiver not found.');
      } else {
        const caregiver = result.rows[0];
        const bookedDates = caregiver.booked_dates || []; // Get the booked dates array

        res.status(200).json({ caregiverEmail, bookedDates });
      }
    }
  });
};


  
 

const getAllBookings = (req, res) => {
  pool.query(queries.getAllBookings, (err, result) => {
    if (err) {
      console.log('Error fetching bookings:', err);
      res.status(500).send('Error fetching bookings.');
    } else {
      res.status(200).json(result.rows);
    }
  });
};

const getBookingsByUserEmail = (req, res) => {
  const user_email = req.params.user_email;

  pool.query(queries.getBookingsByUserEmail, [user_email], (err, result) => {
    if (err) {
      console.error('Error fetching bookings by user email:', err);
      res.status(500).send('Error fetching bookings by user email.');
    } else {
      if (result.rows.length === 0) {
        res.status(404).send('No bookings found for this user email.');
      } else {
        res.status(200).json(result.rows);
      }
    }
  });
};

// Function to get bookings by caregiver email
const getBookingsByCaregiverEmail = (req, res) => {
  const caregiver_email = req.params.caregiver_email;

  pool.query(queries.getBookingsByCaregiverEmail, [caregiver_email], (err, result) => {
    if (err) {
      console.log('Error fetching bookings by caregiver email:', err);
      res.status(500).send('Error fetching bookings by caregiver email.');
    } else {
      if (result.rows.length === 0) {
        res.status(404).send('No bookings found for this caregiver email.');
      } else {
        res.status(200).json(result.rows);
      }
    }
  });
};

const getBookingReviewsByCaregiverEmail = (req, res) => {
  const caregiverEmail = req.params.caregiverEmail;

  pool.query(queries.getBookingReviewsByCaregiverEmail, [caregiverEmail], (err, result) => {
    if (err) {
      console.log('Error fetching booking reviews:', err);
      res.status(500).send('Error fetching booking reviews.');
    } else {
      res.status(200).json(result.rows);
    }
  });
};

  

const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No image file provided.');
    }

    const imageUrl = `/images/${req.file.filename}`; // Construct the image URL

    // You can store the image URL in the database or perform any other required operations

    res.status(200).json({ message: 'Image uploaded successfully!', imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Error uploading image.');
  }
};

const createBooking = (req, res) => {
  const {
    user_email,
    caregiver_email,
    start_time,
    end_time,
    user_homeaddress,
    total_hours,
    total_amount,
    payment_status,
    number_of_kids,
    transport_needs,
    special_needs,
    comments,
    selected_dates, // Add selected_dates parameter
  } = req.body;

  pool.query(
    queries.createBooking,
    [
      user_email,
      caregiver_email,
      start_time,
      end_time,
      user_homeaddress,
      total_hours,
      total_amount,
      payment_status,
      number_of_kids,
      transport_needs,
      special_needs,
      comments,
      JSON.stringify(selected_dates),
    ],
    (err, result) => {
      if (err) {
        console.error('Error creating booking:', err);
        res.status(500).send('Error creating booking.');
      } else {
        res.status(201).json(result.rows[0]);
      }
    }
  );
};

  const uploadCaregiverImage = async (req, res) => {
    try {
      const { image_url } = req.body;
  
      // Convert the base64-encoded image data to binary
      const imageData = Buffer.from(image_url, 'base64');
  
      // Save the binary image data to a folder on the server (e.g., 'images' folder)
      const imageExtension = '.jpg'; // You can modify this based on the actual image type
      const imageFileName = `${Date.now()}${imageExtension}`;
      const imagePath = path.join(__dirname, '../../images', imageFileName);
  
      fs.writeFileSync(imagePath, imageData);
  
      // Save the image URL in the database
      const imageUrl = `/images/${imageFileName}`;
  
      // Update the caregiver's image_url in the database
      const email = req.body.email; // Assuming you are passing the caregiver's email in the request body
  
      pool.query(queries.updateCaregiverImage, [imageUrl, email], (err, result) => {
        if (err) {
          console.error('Error updating caregiver image URL:', err);
          res.status(500).send('Error updating caregiver image URL.');
        } else {
          res.status(200).json({ message: 'Caregiver image uploaded successfully!', imageUrl });
        }
      });
    } catch (error) {
      console.error('Error uploading caregiver image:', error);
      res.status(500).send('Error uploading caregiver image.');
    }
  };

  const updateBookingStatus = (req, res) => {
    const bookingId = req.params.bookingId;
    const newStatus = req.body.booking_status; // 'accepted' or 'rejected'
  
    
    pool.query(queries.updateBookingStatus, [newStatus, bookingId], (err, result) => {
      if (err) {
        console.error('Error updating booking status:', err);
        res.status(500).send('Error updating booking status.');
      } else {
        res.status(200).json({ message: 'Booking status updated successfully!' });
      }
    });
  };
  const getBookingById = (req, res) => {
    const bookingId = req.params.bookingId;
  
    pool.query(queries.getBookingById, [bookingId], (err, result) => {
      if (err) {
        console.error('Error fetching booking by ID:', err);
        res.status(500).send('Error fetching booking by ID.');
      } else {
        if (result.rows.length === 0) {
          res.status(404).send('Booking not found.');
        } else {
          res.status(200).json(result.rows[0]);
        }
      }
    });
  };
  
const completeBooking = async (req, res) => {
  const { bookingId } = req.params;
  const { status, caregiver_comment } = req.body;

  try {
    // Update booking status
    await pool.query(queries.updateBookingStatus, [status, bookingId]);

    // Update caregiver comment
    await pool.query(queries.updateBookingCaregiverComment, [caregiver_comment, bookingId]);

    res.status(200).json({ message: 'Booking completed successfully' });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const updateBookingReview = async (req, res) => {
  const { bookingId } = req.params;
  const { caregiver_rating, review_comment } = req.body;

  try {
    await pool.query(queries.updateBookingReview, [caregiver_rating, review_comment, bookingId]);
    res.status(200).json({ message: 'Booking review updated successfully' });
  } catch (error) {
    console.error('Error updating booking review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const getReviewStats = (req, res) => {
  const caregiverEmail = req.params.email;

  const query = `
    SELECT
      COUNT(*)::integer AS total_ratings,
      ROUND(AVG(caregiver_rating))::integer AS average_rating
    FROM
      public.bookings
    WHERE
      caregiver_email = $1
      AND caregiver_rating IS NOT NULL
  `;

  pool.query(query, [caregiverEmail], (err, result) => {
    if (err) {
      console.error('Error fetching review stats:', err);
      res.status(500).send('Error fetching review stats.');
    } else {
      const stats = result.rows[0];
      res.status(200).json(stats);
    }
  });
};



const getAdvertisedCaregivers = (req, res) => {
  
  console.log('Function called!');
  pool.query(queries.getAdvertisedCaregivers, (err, result) => {

    if (err) {
      console.error('Error fetching advertised caregivers:', err);
      res.status(500).send('Error fetching advertised caregivers.');
    } else {
      res.status(200).json(result.rows);
    }
  });
};

//Messaging Function
const sendMessage = (req, res) => {
  const { senderEmail, receiverEmail, message } = req.body;
  // Insert the message into the 'messages' table in the database
  pool.query(
      'INSERT INTO messages (sender_email, receiver_email, message) VALUES ($1, $2, $3) RETURNING *',
      [senderEmail, receiverEmail, message],
      (err, result) => {
          if (err) {
              console.error('Error sending message:', err);
              res.status(500).send('Error sending message.');
          } else {
              res.status(201).json(result.rows[0]);
          }
      }
  );
};

const getMessages = (req, res) => {
  const { userEmail, caregiverEmail } = req.params;

  // Retrieve messages between the user and caregiver
  pool.query(
    'SELECT sender_email, receiver_email, message, timestamp FROM messages WHERE (receiver_email = $1 AND sender_email = $2) OR (receiver_email = $2 AND sender_email = $1) ORDER BY timestamp DESC',
    [userEmail, caregiverEmail],
    (err, result) => {
      if (err) {
        console.error('Error fetching messages:', err);
        res.status(500).send('Error fetching messages.');
      } else {
        const messages = result.rows.map((row) => ({
          sender: row.sender_email,
          receiver: row.receiver_email,
          message: row.message,
          timestamp: row.timestamp,
        }));
        res.status(200).json(messages);
      }
    }
  );
};


const getRecentCaregiversForUser = (req, res) => {
  const user_email = req.params.user_email;

  // SQL query to get recent caregivers booked by the user
  const query = `
    SELECT DISTINCT ON (c.email) c.*, b.booking_date
    FROM caregivers c
    LEFT JOIN bookings b ON c.email = b.caregiver_email AND b.user_email = $1
    ORDER BY c.email, b.booking_date DESC NULLS LAST;
  `;

  pool.query(query, [user_email], (err, result) => {
    if (err) {
      console.error('Error fetching recent caregivers for user:', err);
      res.status(500).send('Error fetching recent caregivers for user.');
    } else {
      if (result.rows.length === 0) {
        res.status(404).send('No recent caregivers found for this user.');
      } else {
        res.status(200).json(result.rows);
      }
    }
  });
};

const getRecentUsersForCaregiver = (req, res) => {
  const caregiverEmail = req.params.caregiverEmail;

  // SQL query to get recent users who booked the caregiver
  const query = `
    SELECT DISTINCT ON (u.email) u.*, b.booking_date
    FROM users u
    LEFT JOIN bookings b ON u.email = b.user_email AND b.caregiver_email = $1
    ORDER BY u.email, b.booking_date DESC NULLS LAST;
  `;

  pool.query(query, [caregiverEmail], (err, result) => {
    if (err) {
      console.error('Error fetching recent users for caregiver:', err);
      res.status(500).send('Error fetching recent users for caregiver.');
    } else {
      if (result.rows.length === 0) {
        res.status(404).send('No recent users found for this caregiver.');
      } else {
        res.status(200).json(result.rows);
      }
    }
  });
};



  

module.exports = {

    getUsers,
    getUserByEmail,
    registerUser,
    deleteUser,
    updateUser, 
    loginUser,
    getAllCaregivers,
    getCaregiverByEmail,
    registerCaregiver,
    loginCaregiver,
    getAllBookings,
    getBookingsByCaregiverEmail,
    createBooking,
    getBookingsByUserEmail,
    uploadCaregiverImage,
    loginAllUsers,
    uploadImage,
    getAllParents,
    getAllCareGiversNotApproved,
    getAllCareGiversApproved,
    approveCaregiver,
    CaregiverProfile,
	LoginAdmin,
	AdminProfile,
	DeclineCaregiver,
  updateBookingStatus,
  getBookingById,
  completeBooking,
  updateBookingReview,
  getReviewStats,
  getAdvertisedCaregivers,
	CaregiverMonths,//added from here
	NumApproved,
	NumUnApproved,
	LanguageCount,
	TotalCareGivers,
	AverageRating,
	getParentLanguages,
	getCaregiverIncome,
	getCompanyIncome,
	getCaregiverTotalIncome,
	advertiseCaregiver,
  updateBookedDates,
  getBookedDatesByCaregiverEmail,
  sendMessage,
  getMessages,
  getBookingReviewsByCaregiverEmail,
  advertiseCaregiver,//new
 getUsersByEmail,
 SendEmail,
 GetSentEmails,
   GetReceivedEmails,
 GetEmailByID,
 ApplyTraining,
 getAllAdvertisedCaregivers,
 SearchCaregiver,
 getRecentCaregiversForUser,
 getRecentUsersForCaregiver,
 TotalRating,
 MessageCounts //new again

}