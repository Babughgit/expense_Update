const express = require('express');
const path = require('path');
const router = express.Router();

// Route for Signup page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'..','views','Signup.html'));
});

// Route for Login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'Login.html'));
});

// Route for Dashboard (Expense Tracker)
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'expense.html'));
});

module.exports = router;
