const express = require("express");
const router = express.Router();

const { handleDownloadBackup } = require("../../../controllers/backup/backupController");
const ROLES_LIST = require("../../../config/roles_list.js");
const verifyRoles = require("../../../middleware/verifyRoles.js");

// المسار الفعلي سيكون: /api/backup/download
// ومحمي تلقائياً عبر الـ verifyJWT الموجود في server.js
router.get("/download",verifyRoles(ROLES_LIST.Admin), handleDownloadBackup);

module.exports = router;
