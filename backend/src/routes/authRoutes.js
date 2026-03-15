/**
 * Auth routes under /api: POST /register, POST /login (no auth middleware).
 */
const express = require('express');
const { registerValidators, register, loginValidators, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerValidators, register);
router.post('/login', loginValidators, login);

module.exports = router;

