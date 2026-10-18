import bcrypt from "bcrypt";

import type { RequestHandler } from "express";

import cookieOptions from "#src/config/cookieOptions.js";
import { CustomError } from "#src/utils/customErr.js";
import User from "#src/service/userService.js";

import { 
  DecodedToken, 
  FindUserPasswordWithIdResponse, 
  UserResponse, 
  SessionResponse 
} from '#src/types/userType.js';
import type { 
  ChangePasswordType, 
  UpdateUserByIdType,
  DeleteSessionsBy_uuidType,
  GetSessionsQueryType 
} from "#src/middleware/schemas/userSchema.js";


const handleChangePassword: RequestHandler = async (req, res, next) => {
    try {
      if(!req?.userId) throw new CustomError('User Id is Undefined!', 500)
      
      const userId: DecodedToken['userId'] = req.userId; 

      // 1. جلب المستخدم مع الباسورد المشفر الحالي
      const isExistUser: FindUserPasswordWithIdResponse | null = await User.findUserPasswordWithId(userId)

      if (!isExistUser) {
        res.status(404).json({ success: false, message: `Not Found User Id ${userId}` })
        return
      }

      const { currentPassword, newPassword }: ChangePasswordType["body"] = req.body
      // 2. مقارنة كلمة المرور القديمة
      const isMatch: boolean = await bcrypt.compare(currentPassword, isExistUser.password);

      if (!isMatch) {
        res.status(400).json({ success: false, message: "The current password is incorrect." });
        return
      }

      // 3. تشفير كلمة المرور الجديدة
      const hashedPassword: string = await bcrypt.hash(newPassword, 10);

      // 4. تحديث كلمة المرور
      const isUpdated: number | null = await User.changePassword(userId, hashedPassword);

      if (!isUpdated) {
        res.status(400).json({ success: false, message: "An error occurred while changing the password!" });
        return 
      }

      // 5. إبطال جميع الجلسات القديمة للمستخدم من جدول السلاسل
      await User.removeAllUserSessions(userId);

      // 6. مسح كوكيز الـ Refresh Token الحالية من جهاز المستخدم الحالي إن وجدت
      res.clearCookie("jwt", cookieOptions);

      res.status(200).json({
        success: true,
        message: "The password has been changed successfully! Please log in again.",
      });
    } catch (err) {
        next(err);
    }
};

const handleUpdateUserInfo: RequestHandler = async (req, res, next) => {
  try{
      if(!req?.userId) throw new CustomError('User Id is Undefined!', 500)
      if(!req?.roles) throw new CustomError('roles is Undefined!', 500)

      const userId: DecodedToken['userId'] = req.userId;  // أو req.userId بناءً على ما تعينه داخل verifyJWT
      
      const isExistUser: UserResponse | null = await User.findUserById(userId)

      if (!isExistUser) {
        res.status(404).json({ success: false, message: `Not Found User Id ${userId}` })
        return 
      }
      
      const data: UpdateUserByIdType['body'] = req.body

      const roleUser = req.roles as unknown as DecodedToken['roles'];

      if(Number(roleUser) !== 5150 && data.roles) {
        data.roles = roleUser
      }

      const updateUserInfo: UserResponse | null = await User.updateUserById(userId, data)

      if(!updateUserInfo) {
        res.status(400).json({ success: false, message: `An error occurred while Update the data!` })
        return
      }

      res.status(200).json({
        success: true,
        message: "User data updated successfully!",
        data: updateUserInfo
      });
  }catch (err){
    next(err)
  }
}

const handleGetSessionsByUserId: RequestHandler = async (req, res, next) => {
  try{
      if(!req?.userId) throw new CustomError('User Id is Undefined!', 500)

      const userId: DecodedToken['userId'] = req.userId;  // أو req.userId بناءً على ما تعينه داخل verifyJWT
      
      const isExistUser: UserResponse | null = await User.findUserById(userId)

      if (!isExistUser) {
        res.status(404).json({ success: false, message: `Not Found User Id ${userId}` })
        return
      } 

      const { sortBy, sortOrder } = req.query as unknown as GetSessionsQueryType["query"];

      const isSessions: SessionResponse[] = await User.getSessionsByUserId(userId, sortBy, sortOrder);

      res.status(200).json({
        success: true,
        message: `We found ${isSessions?.length} active sessions!`,
        data: isSessions
      });

  }catch (err){
    next(err)
  }
}

const handleRemoveSessionById: RequestHandler = async (req, res, next) => {
  try{
      if(!req?.userId) throw new CustomError('User Id is Undefined!', 500)

      const userId: DecodedToken['userId'] = req.userId;

      const sessionId:  DeleteSessionsBy_uuidType['body']['sessionId'] = req.body.sessionId

      const isExistUser: UserResponse | null = await User.findUserById(userId)
      
      if (!isExistUser) {
        res.status(404).json({ success: false, message: `Not Found User Id ${userId}` })
        return
      } 
      
      const deleteSession: number | null = await User.removeSessionById(sessionId)

      if(!deleteSession){
        res.status(404).json({ success: false, message: `Not Found session Id ${sessionId}`})
        return
      }


      res.status(200).json({
        success: true,
        message: `The session has been successfully deleted!`,
      });

  }catch (err){
    next(err)
  }
}

const handleFindUserById: RequestHandler = async (req, res, next) => {
  try{
      if(!req?.userId) throw new CustomError('User Id is Undefined!', 500)

      const userId: DecodedToken['userId'] = req.userId;

      const isExistUser: UserResponse | null = await User.findUserById(userId);

      if (!isExistUser) {
        res.status(404).json({ success: false, message: `Not Found User Id ${userId}` })
        return
      }
      
      res.status(200).json({
        success: true,
        message: `Found User ${isExistUser.username} successfully`,
        data: isExistUser
      });

  }catch (err){
    next(err)
  }
}


export { 
  handleChangePassword, 
  handleUpdateUserInfo, 
  handleGetSessionsByUserId,
  handleRemoveSessionById,
  handleFindUserById
};