
import User from "#src/service/userService.js";
import type { RequestHandler } from "express";
import bcrypt from "bcrypt";

import type { FindUserByEmailResponse, UserResponse } from "#src/types/userType.js";
import type { CreateUserType } from "#src/middleware/schemas/userSchema.js";

const handleRegister: RequestHandler = async (req, res, next) => {
  try {
    const newUser: CreateUserType["body"] = req.body;

    const duplicate: FindUserByEmailResponse | null = await User.findByEmail(newUser.email);

    if (duplicate) {
      res.status(409).json({ success: false, message: `username ${newUser.email} Not available` });
      return;
    }

    const hashPwd: string = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashPwd;

    const result: UserResponse = await User.createNewUser({
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      roles: newUser.roles,
    });

    res.status(201).json({
      success: true,
      message: `New User ${result?.username} Created!`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export default handleRegister;
