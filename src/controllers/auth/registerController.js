const User = require('../../service/userService.js');
const bcrypt = require("bcrypt");

const handleRegister = async (req, res, next) => {
  try {
    const newUser= req.body;
      
    const duplicate = await User.findByEmail(newUser?.email)
    if (duplicate) 
      return res.status(409).json({ success: false, message: `username ${newUser?.email} Not available` });
    
    const hashPwd = await bcrypt.hash(newUser?.password, 10);

    // create  and store the new user
    const result = await User.createNewUser(newUser)

    res.status(201).json({
      success: true, 
      message: `New User ${result?.username} Created!`,
      data: result
    });
  } catch (err) {
    next(err)
  }
};

module.exports = handleRegister;
