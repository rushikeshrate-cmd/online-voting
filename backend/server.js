const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// FIXED FILE PATH
const DATA_FILE = __dirname + "/data.json";

function readData() {
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// REGISTER
app.post("/register", (req, res) => {
    const { name, email, voterId } = req.body;

    const data = readData();

    if (data.users.find(u => u.voterId === voterId)) {
        return res.json({ success: false, msg: "User already registered!" });
    }

    data.users.push({ name, email, voterId });
    saveData(data);

    res.json({ success: true, msg: "Registration successful!" });
});

// LOGIN
app.post("/login", (req, res) => {
    const { voterId } = req.body;

    const data = readData();
    const user = data.users.find(u => u.voterId === voterId);

    if (!user) {
        return res.json({ success: false, msg: "User not found!" });
    }

    res.json({ success: true, msg: "Login successful!" });
});

// VOTE
app.post("/vote", (req, res) => {
    const { voterId, candidate } = req.body;

    const data = readData();

    if (!data.users.find(u => u.voterId === voterId)) {
        return res.json({ success: false, msg: "User not registered!" });
    }

    if (data.votes.find(v => v.voterId === voterId)) {
        return res.json({ success: false, msg: "You already voted!" });
    }

    data.votes.push({ voterId, candidate });
    saveData(data);

    res.json({ success: true, msg: "Vote submitted!" });
});

// ADMIN VIEW DATABASE
app.get("/data", (req, res) => {
    const key = req.query.key;

    if (key !== "ADMIN123") {
        return res.status(403).json({ error: "Access Denied: Invalid Admin Key" });
    }

    const data = readData();
    res.json(data);
});

// ⭐ RESET DATABASE (ADMIN ONLY)
app.get("/reset", (req, res) => {
    const KEY = req.query.key;

    if (KEY !== "ADMIN123") {
        return res.status(403).json({ success: false, msg: "Access denied!" });
    }

    const emptyData = {
        users: [],
        votes: []
    };

    saveData(emptyData);

    res.json({ success: true, msg: "Database reset successfully!" });
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
