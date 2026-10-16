import express from "express";
const router = express.Router();

import handleRegister from "#src/controllers/auth/registerController.js";
import { createUserSchema } from "#src/middleware/schemas/userSchema.ts";
import { validateRequest } from "#src/middleware/validation.js";
import verifyRoles from "#src/middleware/verifyRoles.js";
import ROLES_LIST from "#src/config/roles_list.js";

router.post(
  "/",
  verifyRoles(ROLES_LIST.Admin),
  validateRequest(createUserSchema),
  handleRegister,
);

export default router;
