const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, requireRole(['Administrator']), userController.getUsers);
router.post('/', authenticateToken, requireRole(['Administrator']), userController.createUser);

module.exports = router;
