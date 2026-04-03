const express = require('express');
const factCheckController = require('../controllers/factCheckController');
const historyController = require('../controllers/historyController');

const router = express.Router();

router.post('/verify', factCheckController.verifyClaim);
router.get('/conversations', historyController.getConversations);
router.get('/conversations/:id/checks', historyController.getFactChecksByConversation);

module.exports = router;