// routes/health.js
const express = require("express");
const router = express.Router();
const pool = require("../config/dbConn");

router.get("/", async (req, res) => {
    try {
        await pool.query("SELECT 1"); // بيتأكد ان الداتا بيز صاحية
        res.status(200).json({
            status: "ok",
            db: "up",
            uptime: process.uptime(),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", db: "down" });
    }
});

module.exports = router;
