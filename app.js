const express = require('express');
const path = require('path');
const con = require('./config/db');
const bcrypt = require('bcrypt');
const session = require('express-session');
const memoryStore = require('memorystore')(session);
const { log } = require('console');
const { request } = require('http');
const app = express();
 
//config 
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    // cookie: { maxAge: 24 * 60 * 60 * 1000 }, //1 day in millsecond
    secret: 'todayisgoodday',
    resave: false,
    saveUninitialized: true,
    store: new memoryStore({
        checkPeriod: 24 * 60 * 60 * 1000
    })
}));

//==================================== login, register ================================
//--------------- hash password ------------
app.get('/password/:raw', function (req, res) {
    const raw = req.params.raw;
    bcrypt.hash(raw, 10, function (err, hash) {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
        else {
            console.log(hash.length);
            res.status(200).send(hash);
        }
    });
});
//---------------- input login -------------
app.post('/', function (req, res) {
    const username = req.body.username;
    const raw_password = req.body.password;

    const sql = "SELECT student_id, user_id, role_id, password, name FROM user WHERE username=?";
    con.query(sql, [username], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        if (results.length === 0) {
            return res.status(401).send('Login failed: username is wrong');
        }

        const hash = results[0].password;
        bcrypt.compare(raw_password, hash, function (err, same) {
            if (err) {
                console.error(err);
                return res.status(500).send('Server error');
            }
            if (same) {
                const role = results[0].role_id;
                let redirectUrl;

                if (role === 1) {
                    redirectUrl = '/roomStu';
                } else if (role === 2) {
                    redirectUrl = '/roomSta';
                } else {
                    redirectUrl = '/roomApp';
                }

                const userId = (role === 1) ? results[0].student_id : results[0].user_id;
                req.session.userId = userId; // collect user_id or student_id
                req.session.userid = results[0].user_id; // collect user_id
                const name = results[0].name;
                // const appName = results[0].app_name;
                const studentId = results[0].student_id
                req.session.name = name; // collect name user
                // req.session.appName = appName; // collect name approver user
                req.session.username = username; // collect username
                req.session.student_id = studentId

                const role2 = results[0].role_id;
                req.session.role = role2; // collect role user
                res.redirect(301, redirectUrl);
            } else {
                return res.status(401).send('Login failed: wrong password');
            }
        });
    });
});
//--------------- input register -----------
app.post('/register', function (req, res) {
    const { student_id, name, username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    bcrypt.hash(password, 10, function (err, hash) {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error1');
        }

        const sql = "INSERT INTO user (student_id, name, username, password, role_id) VALUES (?, ?, ?, ?, 1)";
        con.query(sql, [student_id, name, username, hash], function (err, result) {
            if (err) {
                console.error(err);
                return res.status(500).send('Server error2');
            }
            console.log("User registered successfully");
            res.redirect(301, '/');
        });
    });
});
//---------------- get user info ----------------
app.get('/user', function (req, res) {
    res.json({ "userId": req.session.userId, "userid": req.session.userid, "name": req.session.name, "username": req.session.username, "role": req.session.role, "studentId": req.session.student_id });
});
//---------------- logout ----------------
app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Cannot clear session');
        } else {
            // Clear any session-related data
            req.session = null;
            // Redirect to login page
            res.redirect('/');
        }
    });
});

//==================================== browse room list ===============================
//---------------- get room info ----------------
app.get('/api/rooms', function (req, res) {
    const sql = "SELECT * FROM rooms";
    con.query(sql, function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});
//---------------get rooms,request table for current date-----------
app.get('/api/room_request', function (req, res) {
    const sql = "SELECT * FROM rooms, request WHERE rooms.room_id = request.room_id AND date = CURRENT_DATE ORDER BY rooms.room_id,selecttime";
    con.query(sql, function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});
// ----------------- edit room data -------------------
app.put('/edit/:roomId', function (req, res) {
    const roomId = req.params.roomId;
    const { room_name, room_image, room_des } = req.body;

    const sql = "UPDATE rooms SET roomname = ?, image = ?, description = ? WHERE room_id = ?";
    con.query(sql, [room_name, room_image, room_des, roomId], function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.status(200).json({ message: "Edit data successfully" });
        // res.redirect(301, '/roomSta');
    });
});
// ------------- enable/disable room --------------
app.put('/admin/room/:rid/:status', function (req, res) {
    const sql = "UPDATE rooms SET status=? WHERE room_id=?";
    con.query(sql, [req.params.status, req.params.rid], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        if (results.affectedRows != 1) {
            return res.status(500).send("Update error");
        }
        res.send('Room status updated!');
    });
});
// -----------------add-------------------
app.post('/add', function (req, res) {
    const { room_name, room_image, room_des } = req.body;

    const sql = "INSERT INTO  rooms( roomname, image, description,status ) VALUES (?, ?, ?,'1')";
    con.query(sql, [room_name, room_image, room_des], function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error2');
        }
        console.log("Add data successfully");
        res.redirect(301, '/roomSta');
    });
});
//==================================== dashboard ===============================
// ----------------dashboard---------------
app.get('/api/dashboard', function (req, res) {
    const sql = "SELECT * FROM  request WHERE date = CURRENT_DATE";
    con.query(sql, function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});
//==================================== request ================================
//--------------- SELECT user in request table where status = pending,approved for today-----------
app.get('/api/oneday', (req, res) => {
    userId = req.session.userid;
    // Check if userId exists in the session
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User is not authenticated' });
    }
    const sql = `SELECT * FROM request WHERE user_id = ? AND date = CURRENT_DATE AND (status = 'pending' OR status = 'approved');`;
    con.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).json({ error: 'Error querying database' });
            return;
        }
        res.json(results);
    });
});
//--------------- insert user request to database -----------
app.post('/api/insertRequest', (req, res) => {
    const { roomId, timeSlot } = req.body; // timeSlot such as 08:00-10:00
    const username = req.session.username; //get username from session

    if (!username) {
        return res.status(400).send('Username is missing in session');
    }

    const getUserIdSql = "SELECT user_id FROM user WHERE username = ?";
    con.query(getUserIdSql, [username], (err, results) => {
        if (err) {
            console.error('Error querying user:', err);
            return res.status(500).send('Error querying user');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found');
        }
        //get user_id
        const userId = results[0].user_id;

        const sql = "INSERT INTO request (user_id, room_id, selecttime, date) VALUES (?, ?, ?, CURRENT_DATE)"; // เพิ่ม sertime ลงไปใน SQL query
        con.query(sql, [userId, roomId, timeSlot], (err, result) => {
            if (err) {
                console.error('Error inserting request:', err);
                return res.status(500).send('Error inserting request');
            }
            console.log('Inserted new request');
            res.status(200).json({
                message: 'Inserted new request',
            });
        });
    });
});
//--------------- get user request from database -----------
app.get('/api/getRequest', (req, res) => {
    const sql = `SELECT request.*, user.*, rooms.roomname FROM request JOIN user ON request.user_id = user.user_id JOIN rooms ON rooms.room_id = request.room_id WHERE student_id = ? AND date = CURRENT_DATE ORDER BY request.request_id DESC LIMIT 1`;
    con.query(sql, [req.session.student_id], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).json({ error: 'Error querying database' });
            return;
        }
        res.json(results);
    });
});
//--------------- join table request,user,rooms in database -----------
app.get('/api/appv', (_req, res) => {
    const sql = 'SELECT request.*, user.*,rooms.roomname FROM request JOIN user ON request.user_id = user.user_id JOIN rooms ON request.room_id = rooms.room_id ORDER BY request.request_id';
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).json({ error: 'Error querying database' });
            return;
        }
        res.json(results);
    });
});
// --------------show detail of request for approve,reject------------------------
app.get("/api/appv/:request_id", (req, res) => {
    const requestId = req.params.request_id;

    const sql = `
        SELECT request.*, user.*, rooms.roomname
        FROM request
        INNER JOIN user ON request.user_id = user.user_id
        INNER JOIN rooms ON request.room_id = rooms.room_id
        WHERE request.request_id = ?
    `;

    con.query(sql, [requestId], (err, result) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
        else {
            res.json(result);
        }
    });
});
// -------------- UPDATE approve,reject ------------------------
app.put("/api/updateRequestStatus/:request_id", (req, res) => {
    const requestId = req.params.request_id;
    const newStatus = req.body.status; // รับค่าสถานะใหม่จากข้อมูลที่ส่งมา
    const whoApproved = req.session.userId; // รับไอดีของผู้ใช้จาก session

    // ทำการอัปเดตสถานะของคำขอและคอลัมน์ who_app ในฐานข้อมูล
    const sql = `UPDATE request SET status = ?, who_app = ? WHERE request_id = ?`;

    con.query(sql, [newStatus, whoApproved, requestId], (err, result) => {
        if (err) {
            console.error('Error updating request status:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            console.log(`Request ${requestId} status updated to ${newStatus} by user ${whoApproved} successfully.`);
            res.status(200).json({ message: `Request ${requestId} status updated successfully.` });
        }
    });
});
//---------------  delete request    -----------
app.delete('/delete', (req, res) => {
    // รับข้อมูล request_id ที่ต้องการลบจาก req.body
    const requestId = req.body.request_id;
    console.log(requestId);

    // เชื่อมต่อกับฐานข้อมูล
    con.query('DELETE FROM request WHERE request_id = ?', [requestId], (err, result) => {
        if (err) {
            // หากเกิดข้อผิดพลาดในการลบข้อมูล
            console.error('Error deleting request:', err);
            res.status(500).json({ error: err });
        } else {
            // หากลบข้อมูลสำเร็จ
            console.log('Delete complete for request ID:', requestId);
            res.json({ message: 'Request deleted successfully' });
        }
    });
});
//==================================== history ================================
//--------------- user history -----------
app.get('/api/his_user', (req, res) => {
    const userId = req.session.userid;

    const sql = `
   SELECT 
        request.*, 
        rooms.roomname, 
        u1.username AS who_app_username, 
        u1.user_id AS user_id,
        u2.username AS request_username,
        u2.user_id AS request_user_id,
        CASE 
            WHEN request.selecttime = 1 THEN '8:00-10:00'
            WHEN request.selecttime = 2 THEN '10:00-12:00'
            WHEN request.selecttime = 3 THEN '13:00-15:00'
            WHEN request.selecttime = 4 THEN '15:00-17:00'
            ELSE request.selecttime 
        END AS selecttime 
    FROM 
        request 
        JOIN rooms ON request.room_id = rooms.room_id 
        JOIN user AS u1 ON request.who_app = u1.user_id
        JOIN user AS u2 ON request.user_id = u2.user_id
    WHERE 
        request.user_id = ${userId}
    ORDER BY 
        request.request_id DESC 
    `;
    con.query(sql, (error, results) => {
        if (error) {
            console.error('Database error while fetching booking history:', error);
            return res.status(500).json({ error: 'Database error', details: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No booking history found' });
        }
        console.log("Booking History Data:", results);
        res.json(results);
    });

});
//--------------- staff history -----------
app.get('/api/his_staff', (_req, res) => {
    const sql = `
   SELECT 
        request.*, 
        rooms.roomname, 
        u1.username AS who_app_username, 
        u1.user_id AS user_id,
        u2.username AS request_username,
        u2.user_id AS request_user_id,
        CASE 
            WHEN request.selecttime = 1 THEN '8:00-10:00'
            WHEN request.selecttime = 2 THEN '10:00-12:00'
            WHEN request.selecttime = 3 THEN '13:00-15:00'
            WHEN request.selecttime = 4 THEN '15:00-17:00'
            ELSE request.selecttime 
        END AS selecttime 
    FROM 
        request 
        JOIN rooms ON request.room_id = rooms.room_id 
        JOIN user AS u1 ON request.who_app = u1.user_id
        JOIN user AS u2 ON request.user_id = u2.user_id
    ORDER BY 
        request.request_id DESC 
    `;

    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).json({ error: 'Error querying database' });
            return;
        }
        res.json(results);
    });
});
//--------------- approver history -----------
app.get('/api/his_approver', (req, res) => {
    const userId = req.session.userid; // Assuming you have stored the logged-in user's ID in the session

    const sql = `
   SELECT 
        request.*, 
        rooms.roomname, 
        u1.username AS who_app_username, 
        u1.user_id AS user_id,
        u2.username AS request_username,
        u2.user_id AS request_user_id,
        CASE 
            WHEN request.selecttime = 1 THEN '8:00-10:00'
            WHEN request.selecttime = 2 THEN '10:00-12:00'
            WHEN request.selecttime = 3 THEN '13:00-15:00'
            WHEN request.selecttime = 4 THEN '15:00-17:00'
            ELSE request.selecttime 
        END AS selecttime 
    FROM 
        request 
        JOIN rooms ON request.room_id = rooms.room_id 
        JOIN user AS u1 ON request.who_app = u1.user_id
        JOIN user AS u2 ON request.user_id = u2.user_id
    WHERE 
        request.who_app = ${userId} 
        AND request.status IN ('APPROVED', 'REJECTED')
    ORDER BY 
        request.request_id DESC 
    `;

    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).json({ error: 'Error querying database' });
            return;
        }
        res.json(results);
    });
});

//==================================== route ================================
//--------------- show login page-----------
app.get('/', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/login2/login.html'));
});
//--------------- show register page-----------
app.get('/register', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/login2/register.html'));
});
//--------------- show browse room of student page -----------
app.get('/roomStu', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/browse/brl.html'));
});
//--------------- show browse room of staff page -----------
app.get('/roomSta', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/browse/brl_staff.html'));
});
//--------------- show browse room of approver page -----------
app.get('/roomApp', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/browse/brl_app.html'));
});
//--------------- show add room page -----------
app.get('/add', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/browse/add.html'));
});
//--------------- edit room data page -----------
app.get('/edit/:roomId', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/browse/edit.html'));
});
//--------------- show student request page -----------
app.get('/studentRequest', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/request/request1.html'));
});
//--------------- show student detail request page -----------
app.get('/studentDetail', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/request/detail1.html'));
});
//--------------- show approver request page -----------
app.get('/approveView', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/seerequest/approve_view.html'));
});
//--------------- show approver detail request page -----------
app.get('/approverReq', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/seerequest/approve_req.html'));
});
//--------------- show approver dashboard page -----------
app.get('/dashapp', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/dashboard/dashapp.html'));
});
//--------------- show staff dashboard page -----------
app.get('/dashstaff', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/dashboard/dashboard.html'));
});
//--------------- show user history page -----------
app.get('/hisUser', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/history-v2/his-user.html'));
});
//--------------- show staff history page -----------
app.get('/hisStaff', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/history-v2/his-staff.html'));
});
//--------------- show approver history page -----------
app.get('/hisApprover', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/history-v2/his-approve.html'));
}); 
//--------------- show approver account page -----------
app.get('/accapp', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/account/accapp.html'));
});
//--------------- show approver account page -----------
app.get('/accstaff', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/account/accstaff.html'));
});
//--------------- show approver account page -----------
app.get('/accstu', function (_req, res) {
    res.sendFile(path.join(__dirname, 'public/views/account/accstu.html'));
});
//===================================== port =======================================
const PORT = 3000;
app.listen(PORT, function () {
    console.log('Server is running at port ' + PORT);
});
