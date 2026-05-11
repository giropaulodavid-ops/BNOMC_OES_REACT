const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Creates a unique name: 1715000000-filename.jpg
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));

app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT"],
    credentials: true
}));

app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'bnomc_oes_db'
});

db.connect(err => {
    if (err) console.error("❌ DB Connection Error:", err.message);
    else console.log("✅ Database Connected Successfully");
});

const initAdminAssets = () => {
    const createAdminTable = `CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255)
    )`;

    db.query(createAdminTable, (tableErr) => {
        if (tableErr) {
            console.error("❌ Admin table creation failed:", tableErr.message);
            return;
        }

        const countSql = `SELECT COUNT(*) AS count FROM admins`;
        db.query(countSql, (countErr, rows) => {
            if (countErr) {
                console.error("❌ Admin count failed:", countErr.message);
                return;
            }

            if (rows[0]?.count === 0) {
                bcrypt.hash('admin123', 10, (hashErr, hash) => {
                    if (hashErr) {
                        console.error("❌ Admin seed hashing failed:", hashErr.message);
                        return;
                    }

                    const seedSql = `INSERT INTO admins (username, password) VALUES (?, ?)`;
                    db.query(seedSql, ['admin', hash], (seedErr) => {
                        if (seedErr) {
                            console.error("❌ Admin seed failed:", seedErr.message);
                        } else {
                            console.log("✅ Default admin seeded: admin / admin123");
                        }
                    });
                });
            }
        });
    });
};

initAdminAssets();

const ensureEducationalBackgroundSchema = (callback) => {
    const createEducationTable = `CREATE TABLE IF NOT EXISTS educational_background (
        student_id INT PRIMARY KEY,
        previous_school_attended VARCHAR(255),
        previous_school_address VARCHAR(255),
        previous_grade_level VARCHAR(255),
        previous_school_year VARCHAR(255),
        previous_strand_course VARCHAR(255),
        previous_program VARCHAR(255)
    )`;

    const alterEducationTable = `ALTER TABLE educational_background
        ADD COLUMN IF NOT EXISTS previous_strand_course VARCHAR(255),
        ADD COLUMN IF NOT EXISTS previous_program VARCHAR(255)`;

    db.query(createEducationTable, (err) => {
        if (err) return callback(err);
        db.query(alterEducationTable, callback);
    });
};

const initStudentAssets = () => {
    const createDocumentsTable = `CREATE TABLE IF NOT EXISTS document_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        psa_birth_certificate VARCHAR(255),
        recent_picture VARCHAR(255),
        report_card VARCHAR(255),
        good_moral VARCHAR(255),
        esc_voucher VARCHAR(255),
        honorable_dismissal VARCHAR(255),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    const createPaymentTable = `CREATE TABLE IF NOT EXISTS payment_references (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        reference_number VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Pending',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    const createEnrollmentsTable = `CREATE TABLE IF NOT EXISTS enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        educational_level VARCHAR(255),
        strand VARCHAR(255),
        student_type VARCHAR(255),
        year_level VARCHAR(255),
        semester VARCHAR(255),
        academic_year VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    ensureEducationalBackgroundSchema((err) => {
        if (err) console.error("❌ Failed to ensure educational_background schema:", err.message);
    });
    db.query(createDocumentsTable, (err) => {
        if (err) console.error("❌ Failed to create document_submissions table:", err.message);
    });
    db.query(createPaymentTable, (err) => {
        if (err) console.error("❌ Failed to create payment_references table:", err.message);
    });
    db.query(createEnrollmentsTable, (err) => {
        if (err) console.error("❌ Failed to create enrollments table:", err.message);
    });
};

initStudentAssets();

const toSQLDate = (dateStr) => {
    if (!dateStr || dateStr === "") return null;
    try {
        return new Date(dateStr).toISOString().split('T')[0];
    } catch (e) {
        return null;
    }
};

        // --- Get Active Enrollment Period ---
    app.get('/api/active-period', (req, res) => {
        // Option A: Hardcoded default (Quick fix)
        const currentYear = new Date().getFullYear();
        const activePeriod = {
            academic_year: `${currentYear}-${currentYear + 1}`,
            semester: '1st'
        };

        // Option B: Query from a settings table (If you decide to create one later)
        // db.query("SELECT * FROM settings WHERE key = 'active_period'", (err, results) => { ... });

        res.json(activePeriod);
    });

    // --- Admin: Update Enrollment Period ---
    app.post('/api/admin/active-period', (req, res) => {
        const { academic_year, semester } = req.body;
        const sql = `
            INSERT INTO system_settings (setting_key, setting_value) 
            VALUES ('active_academic_year', ?), ('active_semester', ?)
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        `;
        db.query(sql, [academic_year, semester], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Enrollment period updated successfully!' });
        });
    });

// --- REGISTER ROUTE ---
app.post('/api/register', async (req, res) => {
    const data = req.body;
    console.log("📩 Registration request for:", data.email_address);

    try {
        // Hash the password generated by the frontend
        const hashedPass = await bcrypt.hash(data.password, 10);

        // 1. Insert Student & Guardian info
        const studentSql = `INSERT INTO students (
            password, first_name, middle_name, last_name, date_of_birth, 
            religion, gender, contact_number, email_address, 
            guardian_first_name, guardian_middle_name, guardian_last_name, 
            guardian_birth_date, guardian_occupation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const studentValues = [
            hashedPass, 
            data.first_name, 
            data.middle_name, 
            data.last_name, 
            toSQLDate(data.dob), 
            data.religion, 
            data.gender, 
            data.contact_number, 
            data.email_address, 
            data.guardian_first_name, 
            data.guardian_middle_name, 
            data.guardian_last_name, 
            toSQLDate(data.guardian_birth_date), 
            data.guardian_occupation
        ];

        db.query(studentSql, studentValues, (err, result) => {
            if (err) {
                console.error("❌ SQL Student Error:", err.sqlMessage);
                return res.status(500).json({ error: err.sqlMessage });
            }

            const studentId = result.insertId;

            // 2. Insert Educational Background
            const eduSql = `INSERT INTO educational_background (
                student_id, previous_school_attended, previous_school_address, 
                previous_grade_level, previous_school_year
            ) VALUES (?, ?, ?, ?, ?)`;
            
            const eduValues = [
                studentId, 
                data.prev_school, 
                data.school_address, 
                data.prev_grade, 
                data.school_year
            ];

            db.query(eduSql, eduValues, (eduErr) => {
                if (eduErr) {
                    console.error("❌ SQL Edu Error:", eduErr.sqlMessage);
                    return res.status(500).json({ error: eduErr.sqlMessage });
                }
                res.json({ success: true });
            });
        });
    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// --- LOGIN ROUTE ---
app.post('/api/login', (req, res) => {
    const { email_address, password } = req.body;
    const sql = "SELECT * FROM students WHERE email_address = ?";
    db.query(sql, [email_address], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length === 0) return res.status(401).json({ error: "User not found" });

        const student = results[0];
        let storedHash = student.password;

        if (storedHash.startsWith('$2y$')) {
            storedHash = storedHash.replace('$2y$', '$2a$');
        }

        try {
            const isMatch = await bcrypt.compare(password, storedHash);
            if (isMatch) {
                res.json({ 
                    success: true, 
                    studentId: student.student_id, 
                    name: `${student.first_name} ${student.last_name}` 
                });
            } else {
                res.status(401).json({ error: "Incorrect password" });
            }
        } catch (e) {
            res.status(500).json({ error: "Error verifying password" });
        }
    });
});

app.get('/api/admin/verify-details/:id', (req, res) => {
    const studentId = req.params.id;
    
    const queries = {
        student: "SELECT first_name, last_name FROM students WHERE student_id = ?",
        // We select everything (*) to get all the image paths
        docs: "SELECT * FROM document_submissions WHERE student_id = ? ORDER BY submitted_at DESC LIMIT 1",
        doc_ver: "SELECT doc_status, admin_notes FROM document_verifications WHERE student_id = ?",
        payment: "SELECT reference_number, status, official_receipt FROM payment_references WHERE student_id = ?"
    };

    const results = {};

    db.query(queries.student, [studentId], (err, student) => {
        if (err) return res.status(500).json({ error: "Student Query Error: " + err.message });
        results.student = student[0] || { first_name: 'Unknown', last_name: 'Student' };

        db.query(queries.docs, [studentId], (err, docs) => {
            if (err) return res.status(500).json({ error: "Docs Query Error: " + err.message });
            results.docs = docs[0] || {}; 

            db.query(queries.doc_ver, [studentId], (err, doc_ver) => {
                if (err) return res.status(500).json({ error: "Verif Query Error: " + err.message });
                results.doc_ver = doc_ver[0] || { doc_status: 'Pending', admin_notes: '' };

                db.query(queries.payment, [studentId], (err, payment) => {
                    if (err) return res.status(500).json({ error: "Payment Query Error: " + err.message });
                    
                    const p = payment[0] || {};
                    results.payment = {
                        reference_number: p.reference_number || 'N/A',
                        status: p.status || 'Pending',
                        official_receipt: p.official_receipt || '' // <--- THIS SAVES THE OR
                    };

                    res.json(results);
                });
            });
        });
    });
});

// --- Add these endpoints to server.js ---

    app.get('/api/system-settings', (req, res) => {
        // This query assumes you have a table 'system_settings' 
        // or are storing these in a settings table with id 1
        const sql = "SELECT academic_year, semester FROM system_settings WHERE id = 1";
        
        db.query(sql, (err, results) => {
            if (err) {
                console.error("❌ Error fetching settings:", err.message);
                return res.status(500).json({ error: "Could not fetch settings" });
            }
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).json({ error: "Settings not found" });
            }
        });
    });

// 2. Admin: Update system settings
app.post('/api/admin/update-settings', (req, res) => {
    const { academic_year, semester, status } = req.body;
    
    // Ensure the table name matches what you use in the query
    const sql = "UPDATE system_settings SET academic_year = ?, semester = ?, enrollment_status = ? WHERE id = 1";
    
    db.query(sql, [academic_year, semester, status], (err, result) => {
        if (err) {
            console.error("❌ SQL Error in update-settings:", err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Settings updated successfully!" });
    });
});

// 1. Route to save Document Verification
app.post('/api/admin/verify-documents/:id', (req, res) => {
    const studentId = req.params.id;
    const { status, notes } = req.body;

    const sql = `
        INSERT INTO document_verifications (student_id, doc_status, admin_notes, verified_at)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE doc_status = ?, admin_notes = ?, verified_at = NOW()
    `;

    db.query(sql, [studentId, status, notes, status, notes], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Document status updated!" });
    });
});

// 2. Route to save Payment Receipt (The OR Number)
app.post('/api/admin/verify-payment/:id', (req, res) => {
    const studentId = req.params.id;
    const { official_receipt } = req.body;

    // Use ORDER BY id DESC LIMIT 1 to make sure we hit the LATEST payment entry
    // even if there are multiple rows for one student id
    const sql = `
        UPDATE payment_references 
        SET official_receipt = ?, 
            status = 'Verified', 
            verified_at = NOW() 
        WHERE student_id = ? 
        ORDER BY id DESC LIMIT 1
    `;

    db.query(sql, [official_receipt, studentId], (err, result) => {
        if (err) {
            console.error("❌ SQL Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        
        if (result.affectedRows === 0) {
            // If no row exists yet, we should INSERT one instead of giving up
            const insertSql = `INSERT INTO payment_references (student_id, reference_number, status, official_receipt, verified_at) VALUES (?, 'ONSITE', 'Verified', ?, NOW())`;
            db.query(insertSql, [studentId, official_receipt], (insErr) => {
                if (insErr) return res.status(500).json({ error: insErr.message });
                return res.json({ success: true, message: "New payment record created and verified!" });
            });
        } else {
            res.json({ success: true, message: "Payment verified and OR saved!" });
        }
    });
});

app.get('/api/admin/students', (req, res) => {
    const sql = `
        SELECT 
            s.student_id, 
            s.first_name, 
            s.last_name, 
            e.educational_level AS applied_level, 
            e.created_at AS applied_date,
            dv.doc_status, 
            pr.status AS pay_status
        FROM students s
        LEFT JOIN enrollments e ON s.student_id = e.student_id
        LEFT JOIN document_verifications dv ON s.student_id = dv.student_id
        LEFT JOIN (
            /* This subquery picks only the most recent payment record per student */
            SELECT student_id, status 
            FROM payment_references 
            WHERE id IN (SELECT MAX(id) FROM payment_references GROUP BY student_id)
        ) pr ON s.student_id = pr.student_id
        GROUP BY s.student_id
        ORDER BY s.student_id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

    // Get statistics for the dashboard cards
app.get('/api/admin/stats', (req, res) => {
    const sql = `
        SELECT 
            -- Total actual students
            (SELECT COUNT(*) FROM students) as total,

            -- Only people with existing student records who are verified
            (SELECT COUNT(DISTINCT s.student_id) 
             FROM students s 
             JOIN document_verifications dv ON s.student_id = dv.student_id 
             JOIN payment_references pr ON s.student_id = pr.student_id 
             WHERE dv.doc_status = 'Verified' AND pr.status = 'Verified') as enrollees,

            -- Only count pending if the student STILL EXISTS in the students table
            (SELECT COUNT(DISTINCT ds.student_id) 
             FROM document_submissions ds
             INNER JOIN students s ON ds.student_id = s.student_id 
             LEFT JOIN document_verifications dv ON ds.student_id = dv.student_id
             LEFT JOIN payment_references pr ON ds.student_id = pr.student_id
             WHERE (dv.doc_status IS NULL OR dv.doc_status != 'Verified') 
                OR (pr.status IS NULL OR pr.status != 'Verified')) as pending
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result[0]);
    });
});

    app.post('/api/admin/update-verification', (req, res) => {
        const { studentId, doc_status_update, studentName } = req.body;

        // 1. Update the document status
        const updateSql = "UPDATE document_verifications SET doc_status = ? WHERE student_id = ?";
        db.query(updateSql, [doc_status_update, studentId], (err) => {
            if (err) return res.status(500).json(err);

            // 2. THE FIX: Explicitly log this action so it appears in the sidebar
            const logSql = "INSERT INTO admin_activity_log (activity_text, created_at) VALUES (?, NOW())";
            const logText = `Admin updated documents status to ${doc_status_update} for ${studentId} - ${studentName}`;

            db.query(logSql, [logText], (logErr) => {
                res.json({ message: "Updated and Logged" });
            });
        });
    });

        // Add this to your server.js
    app.get('/api/admin/activities', (req, res) => {
        // Queries the activity log table from your SQL data
        const sql = `SELECT activity_text, created_at 
                    FROM admin_activity_log 
                    ORDER BY created_at DESC 
                    LIMIT 10`;

        db.query(sql, (err, results) => {
            if (err) {
                console.error("❌ Activity log fetch error:", err.message);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(results);
        });
    });

    // Add this to your server.js
app.get('/api/admin/activities', (req, res) => {
    // Selects the activity text and date, ordered by newest first, limited to 10
    const sql = `
        SELECT activity_text, created_at 
        FROM admin_activity_log 
        ORDER BY created_at DESC 
        LIMIT 10
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Activity log fetch error:", err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Add this to your server.js
app.get('/api/admin/student/:id', (req, res) => {
    const studentId = req.params.id;
    // Selecting all from students table as per PHP source
    const sql = `SELECT * FROM students WHERE student_id = ?`;

    db.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error("❌ Profile Query Error:", err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) return res.status(404).json({ error: 'Student not found' });
        res.json(results[0]);
    });
});

app.post('/api/admin/update-doc-status/:id', (req, res) => {
    const studentId = req.params.id;
    const { status, notes } = req.body;
    
    // 1. Update/Insert the verification record
    const sql = `INSERT INTO document_verifications (student_id, doc_status, admin_notes, verified_at) 
                 VALUES (?, ?, ?, NOW()) 
                 ON DUPLICATE KEY UPDATE doc_status = VALUES(doc_status), admin_notes = VALUES(admin_notes), verified_at = NOW()`;

    db.query(sql, [studentId, status, notes], (err) => {
        if (err) return res.status(500).json(err);

        // 2. Add Activity Log
        const logSql = "INSERT INTO admin_activity_log (activity_text, created_at) VALUES (?, NOW())";
        const logText = `Admin updated document status to ${status} for Student ID: ${studentId}`;
        
        db.query(logSql, [logText], (logErr) => {
            if (logErr) console.error("Log error:", logErr);
            res.json({ message: "Document status updated and logged!" });
        });
    });
});

// --- SAVE RECEIPT & VERIFY PAYMENT ---
app.post('/api/admin/save-receipt/:id', (req, res) => {
    const studentId = req.params.id;
    const { orNumber } = req.body; // Changed from official_receipt to orNumber to match frontend

    const sql = `
        UPDATE payment_references 
        SET official_receipt = ?, status = 'Verified', verified_at = NOW() 
        WHERE student_id = ?
        ORDER BY id DESC LIMIT 1
    `;

    db.query(sql, [orNumber, studentId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (result.affectedRows === 0) {
            // If no record exists (e.g., student didn't click "Onsite" yet), create it
            const insertSql = `INSERT INTO payment_references (student_id, reference_number, status, official_receipt, verified_at) VALUES (?, 'ONSITE', 'Verified', ?, NOW())`;
            db.query(insertSql, [studentId, orNumber], (insErr) => {
                if (insErr) return res.status(500).json({ error: insErr.message });
                res.json({ success: true, message: "OR Saved and Verified!" });
            });
        } else {
            res.json({ success: true, message: "OR Saved and Verified!" });
        }
    });
});

app.get('/api/admin/submissions', (req, res) => {
    const sql = `
        SELECT 
            s.student_id, 
            s.first_name, 
            s.last_name, 
            dv.doc_status, 
            pr.status as pay_status,
            -- Logic: If BOTH are Verified, then Enrolled. Otherwise, Not Enrolled.
            CASE 
                WHEN dv.doc_status = 'Verified' AND pr.status = 'Verified' THEN 'Enrolled'
                ELSE 'Not Enrolled'
            END as enrollment_status
        FROM students s
        LEFT JOIN document_verifications dv ON s.student_id = dv.student_id
        LEFT JOIN payment_references pr ON s.student_id = pr.student_id
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get('/api/student/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = `SELECT
        s.student_id,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.date_of_birth,
        s.religion,
        s.gender,
        s.contact_number,
        s.email_address,
        s.guardian_first_name,
        s.guardian_middle_name,
        s.guardian_last_name,
        s.guardian_birth_date,
        s.guardian_occupation,
        eb.previous_school_attended,
        eb.previous_school_address,
        eb.previous_grade_level,
        eb.previous_school_year,
        eb.previous_strand_course,
        eb.previous_program
    FROM students s
    LEFT JOIN educational_background eb ON eb.student_id = s.student_id
    WHERE s.student_id = ?`;

    db.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error(`❌ Student query failed for id=${studentId}:`, err.message);
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) return res.status(404).json({ error: "Student not found" });
        res.json(results[0]);
    });
});

app.put('/api/student/:id', (req, res) => {
    const studentId = req.params.id;
    const {
        first_name,
        middle_name,
        last_name,
        date_of_birth,
        religion,
        gender,
        contact_number,
        email_address,
        guardian_first_name,
        guardian_middle_name,
        guardian_last_name,
        guardian_birth_date,
        guardian_occupation,
        previous_school_attended,
        previous_school_address,
        previous_grade_level,
        previous_school_year
    } = req.body;

    // Update students table
    const updateStudentSql = `UPDATE students SET 
        first_name = ?, 
        middle_name = ?, 
        last_name = ?, 
        date_of_birth = ?, 
        religion = ?, 
        gender = ?, 
        contact_number = ?, 
        email_address = ?, 
        guardian_first_name = ?, 
        guardian_middle_name = ?, 
        guardian_last_name = ?, 
        guardian_birth_date = ?, 
        guardian_occupation = ? 
        WHERE student_id = ?`;

    db.query(updateStudentSql, [
        first_name, middle_name, last_name, date_of_birth, religion, gender,
        contact_number, email_address, guardian_first_name, guardian_middle_name,
        guardian_last_name, guardian_birth_date, guardian_occupation, studentId
    ], (err) => {
        if (err) {
            console.error(`❌ Student update failed for id=${studentId}:`, err.message);
            return res.status(500).json({ error: "Failed to update student", success: false });
        }

        // Update educational_background table
        const updateEducationSql = `UPDATE educational_background SET 
            previous_school_attended = ?, 
            previous_school_address = ?, 
            previous_grade_level = ?, 
            previous_school_year = ? 
            WHERE student_id = ?`;

        db.query(updateEducationSql, [
            previous_school_attended, previous_school_address, 
            previous_grade_level, previous_school_year, studentId
        ], (err) => {
            if (err) {
                console.error(`❌ Education update failed for id=${studentId}:`, err.message);
                return res.status(500).json({ error: "Failed to update education", success: false });
            }
            res.json({ success: true, message: "Student information updated successfully" });
        });
    });
});

app.get('/api/student/:id/enrollment', (req, res) => {
    const studentId = req.params.id;
    const sql = `SELECT previous_school_attended, previous_school_address, previous_grade_level, previous_school_year, previous_strand_course, previous_program FROM educational_background WHERE student_id = ?`;
    db.query(sql, [studentId], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results[0] || {});
    });
});

app.post('/api/student/:id/enrollment', (req, res) => {
    const studentId = req.params.id;
    const {
        previous_school_attended,
        previous_school_address,
        previous_grade_level,
        previous_school_year,
        previous_strand_course,
        previous_program,
    } = req.body;

    ensureEducationalBackgroundSchema((createErr) => {
        if (createErr) return res.status(500).json({ error: "Database error" });

        const findSql = `SELECT student_id FROM educational_background WHERE student_id = ?`;
        db.query(findSql, [studentId], (findErr, findResults) => {
            if (findErr) return res.status(500).json({ error: "Database error" });

            const values = [
                previous_school_attended,
                previous_school_address,
                previous_grade_level,
                previous_school_year,
                previous_strand_course,
                previous_program,
                studentId,
            ];

            if (findResults.length > 0) {
                const updateSql = `UPDATE educational_background SET previous_school_attended = ?, previous_school_address = ?, previous_grade_level = ?, previous_school_year = ?, previous_strand_course = ?, previous_program = ? WHERE student_id = ?`;
                db.query(updateSql, values, (updateErr) => {
                    if (updateErr) return res.status(500).json({ error: "Database error" });
                    res.json({ success: true });
                });
            } else {
                const insertSql = `INSERT INTO educational_background (previous_school_attended, previous_school_address, previous_grade_level, previous_school_year, previous_strand_course, previous_program, student_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                db.query(insertSql, values, (insertErr) => {
                    if (insertErr) return res.status(500).json({ error: "Database error" });
                    res.json({ success: true });
                });
            }
        });
    });
});

app.get('/api/student/:id/documents', (req, res) => {
    const studentId = req.params.id;

    // Fetch the latest submission for this student
    const sql = `
        SELECT 
            psa_birth_certificate, 
            recent_picture, 
            report_card, 
            good_moral, 
            esc_voucher, 
            honorable_dismissal,
            submitted_at
        FROM document_submissions 
        WHERE student_id = ? 
        ORDER BY submitted_at DESC 
        LIMIT 1
    `;

    db.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err.message);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length > 0) {
            // If a record exists, send the data and set isSubmitted to true
            res.json({
                isSubmitted: true,
                data: results[0]
            });
        } else {
            // If no record exists, tell the frontend it's okay to upload
            res.json({
                isSubmitted: false,
                data: null
            });
        }
    });
});

app.get('/api/student/:id/payment', (req, res) => {
    const studentId = req.params.id;
    const sql = `SELECT reference_number, status, submitted_at FROM payment_references WHERE student_id = ? ORDER BY submitted_at DESC LIMIT 1`;
    db.query(sql, [studentId], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results[0] || {});
    });
});

app.post('/api/student/:id/payment', (req, res) => {
    const studentId = req.params.id;
    const { reference_number } = req.body;

    const ensureTable = `CREATE TABLE IF NOT EXISTS payment_references (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        reference_number VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Pending',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    db.query(ensureTable, (createErr) => {
        if (createErr) return res.status(500).json({ error: "Database error" });

        const insertSql = `INSERT INTO payment_references (student_id, reference_number) VALUES (?, ?)`;
        db.query(insertSql, [studentId, reference_number], (insertErr) => {
            if (insertErr) return res.status(500).json({ error: "Database error" });
            res.json({ success: true });
        });
    });
});

app.get('/api/student/:id/payment-status', (req, res) => {
    const studentId = req.params.id;
    const sql = `SELECT reference_number, status, official_receipt FROM payment_references WHERE student_id = ? ORDER BY id DESC LIMIT 1`;
    
    db.query(sql, [studentId], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        
        if (results.length > 0) {
            res.json({ exists: true, data: results[0] });
        } else {
            res.json({ exists: false });
        }
    });
});

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM admins WHERE username = ?';

    db.query(sql, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(401).json({ error: 'Admin not found' });

        const admin = results[0];
        try {
            const isMatch = await bcrypt.compare(password, admin.password);
            if (isMatch) {
                res.json({ success: true, username: admin.username });
            } else {
                res.status(401).json({ error: 'Incorrect password' });
            }
        } catch (compareErr) {
            res.status(500).json({ error: 'Error verifying password' });
        }
    });
});

app.get('/api/admin/student/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = `SELECT
        s.student_id,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.date_of_birth,
        s.religion,
        s.gender,
        s.contact_number,
        s.email_address,
        s.guardian_first_name,
        s.guardian_middle_name,
        s.guardian_last_name,
        s.guardian_birth_date,
        s.guardian_occupation,
        COALESCE(ds.doc_type, '') AS doc_type,
        COALESCE(ds.file_link, '') AS document_link,
        COALESCE(ds.doc_status, 'Pending') AS doc_status,
        COALESCE(ds.submitted_at, '') AS document_submitted_at,
        COALESCE(pr.reference_number, '') AS reference_number,
        COALESCE(pr.status, 'Pending') AS payment_status,
        COALESCE(pr.submitted_at, '') AS payment_submitted_at
    FROM students s
    LEFT JOIN (
        SELECT student_id, doc_type, file_link, doc_status, submitted_at
        FROM document_submissions
        WHERE id IN (SELECT MAX(id) FROM document_submissions GROUP BY student_id)
    ) ds ON ds.student_id = s.student_id
    LEFT JOIN (
        SELECT student_id, reference_number, status, submitted_at
        FROM payment_references
        WHERE id IN (SELECT MAX(id) FROM payment_references GROUP BY student_id)
    ) pr ON pr.student_id = s.student_id
    WHERE s.student_id = ?`;

    db.query(sql, [studentId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ error: 'Student not found' });
        res.json(results[0]);
    });
});

app.post('/api/admin/student/:id/documents', (req, res) => {
    const studentId = req.params.id;
    const { status } = req.body;
    const updateSql = `UPDATE document_submissions SET doc_status = ? WHERE id = (
        SELECT id FROM (
            SELECT id FROM document_submissions WHERE student_id = ? ORDER BY submitted_at DESC LIMIT 1
        ) AS latest
    )`;

    db.query(updateSql, [status, studentId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'No document submission found' });
        res.json({ success: true });
    });
});

app.post('/api/admin/student/:id/payment', (req, res) => {
    const studentId = req.params.id;
    const { status } = req.body;
    const updateSql = `UPDATE payment_references SET status = ? WHERE id = (
        SELECT id FROM (
            SELECT id FROM payment_references WHERE student_id = ? ORDER BY submitted_at DESC LIMIT 1
        ) AS latest
    )`;

    db.query(updateSql, [status, studentId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'No payment record found' });
        res.json({ success: true });
    });
});

// ========== ENROLL TO ENDPOINTS ==========

app.get('/api/student/:id/enrollment-status', (req, res) => {
    const studentId = req.params.id;

    // We join the tables or use subqueries to get the statuses
    const sql = `
        SELECT 
            (SELECT doc_status FROM document_verifications WHERE student_id = ? LIMIT 1) AS doc_status,
            (SELECT status FROM payment_references WHERE student_id = ? ORDER BY id DESC LIMIT 1) AS payment_status
    `;

    db.query(sql, [studentId, studentId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        const data = results[0] || {};
        
        // If the record doesn't exist yet, default to 'Pending'
        const docStatus = data.doc_status || 'Pending';
        const payStatus = data.payment_status || 'Pending';

        // Logic: Enrolled only if both are 'Verified'
        const isEnrolled = (docStatus === 'Verified' && payStatus === 'Verified');

        res.json({ 
            isEnrolled, 
            doc_status: docStatus, 
            pay_status: payStatus 
        });
    });
});

app.get('/api/student/:id/enroll-to', (req, res) => {
    const studentId = req.params.id;
    const sql = `SELECT educational_level, strand, student_type, year_level, semester, academic_year 
                 FROM enrollments WHERE student_id = ? ORDER BY created_at DESC LIMIT 1`;
    
    db.query(sql, [studentId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results.length > 0 ? results[0] : {});
    });
});

app.post('/api/student/:id/enroll-to', (req, res) => {
    const studentId = req.params.id;
    const {
        educational_level,
        strand,
        student_type,
        year_level,
        semester,
        academic_year
    } = req.body;

    const sql = `INSERT INTO enrollments (student_id, educational_level, strand, student_type, year_level, semester, academic_year) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [studentId, educational_level, strand, student_type, year_level, semester, academic_year], (err) => {
        if (err) {
            console.error(`❌ Enrollment insert failed for id=${studentId}:`, err.message);
            return res.status(500).json({ error: 'Failed to save enrollment', success: false });
        }
        res.json({ success: true, message: 'Enrollment submitted successfully' });
    });
});

// ========== DOCUMENTS ENDPOINTS ==========

app.post('/api/student/:id/documents-submit', upload.fields([
    { name: 'psa_birth_certificate', maxCount: 1 },
    { name: 'recent_picture', maxCount: 1 },
    { name: 'report_card', maxCount: 1 },
    { name: 'good_moral', maxCount: 1 },
    { name: 'esc_voucher', maxCount: 1 },
    { name: 'honorable_dismissal', maxCount: 1 }
]), (req, res) => {
    const studentId = req.params.id;
    const files = req.files;

    // Helper to get the path if file exists, else null
    const getPath = (field) => (files[field] ? files[field][0].path.replace(/\\/g, '/') : null);

    const sql = `INSERT INTO document_submissions 
                (student_id, psa_birth_certificate, recent_picture, report_card, good_moral, esc_voucher, honorable_dismissal) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        studentId,
        getPath('psa_birth_certificate'),
        getPath('recent_picture'),
        getPath('report_card'),
        getPath('good_moral'),
        getPath('esc_voucher'),
        getPath('honorable_dismissal')
    ];

    db.query(sql, values, (err) => {
        if (err) {
            console.error('❌ Upload Error:', err.message);
            return res.status(500).json({ error: 'Failed to save document paths' });
        }
        res.json({ message: 'Files uploaded and paths saved successfully!' });
    });
});

app.post('/api/student/:id/documents-submit', (req, res) => {
    const studentId = req.params.id;
    const {
        psa_birth_certificate,
        recent_picture,
        report_card,
        good_moral,
        esc_voucher,
        honorable_dismissal
    } = req.body;

    const sql = `INSERT INTO document_submissions (student_id, psa_birth_certificate, recent_picture, report_card, good_moral, esc_voucher, honorable_dismissal) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [
        studentId,
        psa_birth_certificate || null,
        recent_picture || null,
        report_card || null,
        good_moral || null,
        esc_voucher || null,
        honorable_dismissal || null
    ], (err) => {
        if (err) {
            console.error(`❌ Document insert failed for id=${studentId}:`, err.message);
            return res.status(500).json({ error: 'Failed to save documents' });
        }
        res.json({ success: true, message: 'Documents submitted successfully' });
    });
});

app.listen(5000, '0.0.0.0', () => {
    console.log("🚀 Server running on http://127.0.0.1:5000");
});