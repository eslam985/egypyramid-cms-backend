const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // حد أقصى 5 ميجابايت
});

module.exports = upload;