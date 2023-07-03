const express = require('express');
const router = express.Router();
const { getChat } = require('../controllers/chat');

// Routes for contacts
router.get('/', getChat)

module.exports = router;