
require("dotenv").config();

const express = require("express");
const pool = require("./db");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const PORT = process.env.PORT || 5000;

// GET ALL STUDENTS
app.get("/students", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM students ORDER BY id ASC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error("GET STUDENTS ERROR:", error);
        res.status(500).json({
            message: "Error retrieving students"
        });
    }
});

// GET STUDENT BY ID
app.get("/students/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM students WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student record not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("GET STUDENT ERROR:", error);
        res.status(500).json({
            message: "Error searching for student"
        });
    }
});

// ADD STUDENT
app.post("/students", async (req, res) => {
    try {
        const { name, age, course, email } = req.body;

        if (!name || !age || !course || !email) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO students (name, age, course, email)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, age, course, email]
        );

        res.status(201).json({
            message: "Student record added successfully",
            student: result.rows[0]
        });
    } catch (error) {
        console.error("INSERT ERROR:", error);
        res.status(500).json({
            message: "Student was not inserted",
            error: error.message
        });
    }
});

// STUDENT LOGIN
app.post("/login", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const result = await pool.query(
            "SELECT * FROM students WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email. Student not found."
            });
        }

        const student = result.rows[0];

        res.json({
            message: "Login successful",
            student: {
                id: student.id,
                name: student.name,
                age: student.age,
                course: student.course,
                email: student.email
            }
        });
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({
            message: "Server error during login"
        });
    }
});

// UPDATE STUDENT BY ID
app.put("/students/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, course, email } = req.body;

        if (!name || !age || !course || !email) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const result = await pool.query(
            `UPDATE students
             SET name = $1,
                 age = $2,
                 course = $3,
                 email = $4
             WHERE id = $5
             RETURNING *`,
            [name, age, course, email, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student record not found"
            });
        }

        res.json({
            message: "Student updated successfully",
            student: result.rows[0]
        });
    } catch (error) {
        console.error("UPDATE ERROR:", error);
        res.status(500).json({
            message: "Student could not be updated",
            error: error.message
        });
    }
});

// UPDATE ALL STUDENTS
app.patch("/students", async (req, res) => {
    try {
        const { name, age, course, email } = req.body;

        if (!name || !age || !course || !email) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const result = await pool.query(
            `UPDATE students
             SET name = $1,
                 age = $2,
                 course = $3,
                 email = $4`,
            [name, age, course, email]
        );

        res.json({
            message: `${result.rowCount} student(s) updated successfully`,
            updatedCount: result.rowCount
        });
    } catch (error) {
        console.error("PATCH ERROR:", error);
        res.status(500).json({
            message: "Students could not be updated",
            error: error.message
        });
    }
});

// DELETE STUDENT BY ID
app.delete("/students/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM students WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student record not found"
            });
        }

        res.json({
            message: "Student deleted successfully",
            student: result.rows[0]
        });
    } catch (error) {
        console.error("DELETE ERROR:", error);
        res.status(500).json({
            message: "Student could not be deleted"
        });
    }
});

// DELETE STUDENTS BY NAME
app.delete("/students/search/name/:name", async (req, res) => {
    try {
        const { name } = req.params;

        const result = await pool.query(
            "DELETE FROM students WHERE LOWER(name) = LOWER($1) RETURNING *",
            [name]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "No student found with that name"
            });
        }

        res.json({
            message: `${result.rows.length} student record(s) deleted successfully`,
            students: result.rows
        });
    } catch (error) {
        console.error("DELETE BY NAME ERROR:", error);
        res.status(500).json({
            message: "Students could not be deleted"
        });
    }
});

// DELETE STUDENTS BY AGE
app.delete("/students/search/age/:age", async (req, res) => {
    try {
        const { age } = req.params;

        const result = await pool.query(
            "DELETE FROM students WHERE age = $1 RETURNING *",
            [age]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "No student found with that age"
            });
        }

        res.json({
            message: `${result.rows.length} student record(s) deleted successfully`,
            students: result.rows
        });
    } catch (error) {
        console.error("DELETE BY AGE ERROR:", error);
        res.status(500).json({
            message: "Students could not be deleted"
        });
    }
});

// DELETE STUDENTS BY COURSE
app.delete("/students/search/course/:course", async (req, res) => {
    try {
        const { course } = req.params;

        const result = await pool.query(
            "DELETE FROM students WHERE LOWER(course) = LOWER($1) RETURNING *",
            [course]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "No student found with that course"
            });
        }

        res.json({
            message: `${result.rows.length} student record(s) deleted successfully`,
            students: result.rows
        });
    } catch (error) {
        console.error("DELETE BY COURSE ERROR:", error);
        res.status(500).json({
            message: "Students could not be deleted"
        });
    }
});

// DELETE STUDENTS BY EMAIL
app.delete("/students/search/email/:email", async (req, res) => {
    try {
        const { email } = req.params;

        const result = await pool.query(
            "DELETE FROM students WHERE LOWER(email) = LOWER($1) RETURNING *",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "No student found with that email"
            });
        }

        res.json({
            message: `${result.rows.length} student record(s) deleted successfully`,
            students: result.rows
        });
    } catch (error) {
        console.error("DELETE BY EMAIL ERROR:", error);
        res.status(500).json({
            message: "Students could not be deleted"
        });
    }
});

// DELETE ALL STUDENTS
app.delete("/students", async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM students RETURNING *"
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "There are no students to delete"
            });
        }

        res.json({
            message: `${result.rows.length} student record(s) deleted successfully`,
            students: result.rows
        });
    } catch (error) {
        console.error("DELETE ALL ERROR:", error);
        res.status(500).json({
            message: "Students could not be deleted"
        });
    }
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
