const express = require("express");
const router = express.Router();

const { handleDownloadBackup } = require("../../../controllers/backup/backupController");

// المسار الفعلي سيكون: /api/backup/download
// ومحمي تلقائياً عبر الـ verifyJWT الموجود في server.js
router.get("/download", handleDownloadBackup);

module.exports = router;
