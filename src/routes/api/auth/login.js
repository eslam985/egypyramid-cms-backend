import express from "express";
const router = express.Router();

import { loginUserSchema } from "#src/middleware/schemas/userSchema.ts";
import handleLogin from "#src/controllers/auth/loginController.js";
import { validateRequest } from "#src/middleware/validation.js";

// 💡 تم حذف verifyRoles لأن المستخدم لا يمتلك صلاحية قبل الـ login
router.post("/", validateRequest(loginUserSchema), handleLogin);

export default router;
