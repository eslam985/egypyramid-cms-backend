import express from "express";
const router = express.Router();

import { handleDownloadBackup } from "#src/controllers/backup/backupController.js";
import verifyRoles from "#src/middleware/verifyRoles.js";
import ROLES_LIST from "#src/config/roles_list.js";

router.get("/download", verifyRoles(ROLES_LIST.Admin), handleDownloadBackup);

export default router;
