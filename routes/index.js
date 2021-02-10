const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");
const questionRoutes = require("./question");
const answerRoutes = require("./answer");
const roleRoutes = require("./role");
const userRoutes = require("./user");


router.use("/auth",authRoutes)
router.use("/question",questionRoutes)
router.use("/answer",answerRoutes)
router.use("/role",roleRoutes)
router.use("/user",userRoutes)


module.exports = router;