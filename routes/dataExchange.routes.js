const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  exportData,
  importData,
} = require('../controllers/dataExchange.controller');

// Use memory storage for quick processing
const upload = multer({ storage: multer.memoryStorage() });

router.get('/export', exportData);
router.post('/import', upload.single('file'), importData);

module.exports = router;
