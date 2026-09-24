const bcrypt = require('bcrypt');
const User = require('../../service/userService')

const handleChangePassword = async (req, res, next) => {
    try {
      const userId = req.userId; 
      // 1. جلب المستخدم مع الباسورد المشفر الحالي
      const isExistUser = await User.findUserById(userId)
      if (!isExistUser) return res.status(404).json({ success: false, message: `Not Found User Id ${userId}` })

      const { currentPassword, newPassword } = req.body
      // 2. مقارنة كلمة المرور القديمة
      const isMatch = await bcrypt.compare(currentPassword, isExistUser.password);
      if (!isMatch) return { success: false, message: "The current password is incorrect." };

      // 3. تشفير كلمة المرور الجديدة
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 4. تحديث كلمة المرور
      const isUpdated = await User.changePassword(userId, hashedPassword);

      if (!isUpdated) {
        return res.status(400).json({ success: false, message: "An error occurred while changing the password!" });
      }

      // 5. إبطال جميع الجلسات القديمة للمستخدم من جدول السلاسل
      await User.removeAllUserSessions(userId);

      // 6. مسح كوكيز الـ Refresh Token الحالية من جهاز المستخدم الحالي إن وجدت
      res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

      return res.status(200).json({
        success: true,
        message: "The password has been changed successfully! Please log in again.",
      });
    } catch (err) {
        next(err);
    }
};

const handleUpdateUserInfo = async (req, res, next) => {
  try{
      const userId = req.userId;; // أو req.userId بناءً على ما تعينه داخل verifyJWT

      const isExistUser = await User.findUserById(userId)
      if (!isExistUser) return res.status(404).json({ success: false, message: `Not Found User Id ${userId}` })
      
      const data = req.body
      if (data.id || data.password) 
        return res.status(400).json({ 
          success: false, message: `The ID must not be sent in the body, and the password cannot be changed here!` 
        })

      const updateUserInfo = await User.updateUserById(userId, data)
      if(!updateUserInfo) 
        return res.status(400).json({ success: false, message: `An error occurred while Update the data!` })

      return res.status(200).json({
        success: true,
        message: "User data updated successfully!",
        data: updateUserInfo
      });
  }catch (err){
    next(err)
  }
}

const handleGetSessionsByUserId = async (req, res, next) => {
  try{
      const userId = req.userId;; // أو req.userId بناءً على ما تعينه داخل verifyJWT

      const isExistUser = await User.findUserById(userId)
      if (!isExistUser) return res.status(404).json({ success: false, message: `Not Found User Id ${userId}` })
      
      const isSessions = await User.getSessionsByUserId(userId)

      return res.status(200).json({
        success: true,
        message: `We found ${isSessions.length} active sessions!`,
        data: isSessions
      });

  }catch (err){
    next(err)
  }
}

const handleRemoveSessionById = async (req, res, next) => {
  try{
      const sessionId = req.body.sessionId

      const isExistUser = await User.findUserById(userId)
      if (!isExistUser) return res.status(404).json({ success: false, message: `Not Found User Id ${userId}` })
      
      const deleteSession = await User.removeSessionById(sessionId)

      if(!deleteSession)
        return res.status(400).json({ 
          success: false, message: `An error occurred while deleting the session Id ${sessionId}` 
        })

      return res.status(200).json({
        success: true,
        message: `The session has been successfully deleted!`,
      });

  }catch (err){
    next(err)
  }
}

module.exports = { 
  handleChangePassword, 
  handleUpdateUserInfo, 
  handleGetSessionsByUserId,
  handleRemoveSessionById
};