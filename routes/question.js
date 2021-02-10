const express = require("express");
const { getAccessToRoute,checkPermission } = require("../middlewares/auth/auth");
const router = express.Router();
const question = require("../controllers/question");


// router.post("/new",getAccessToRoute,checkPermission("question","create"),question.newQuestion)
router.post("/new",getAccessToRoute,question.newQuestion)

// router.post("/new",getAccessToRoute,checkPermission("question","edit"),question.newQuestion)
router.put("/update",getAccessToRoute,question.updateQuestion)

// router.post("/new",getAccessToRoute,checkPermission("question","read"),question.newQuestion)
router.get("/get/:slug/:id",question.getQuestionBySlug)

// router.post("/new",getAccessToRoute,checkPermission("question","delete"),question.newQuestion)
router.delete("/delete",getAccessToRoute,question.deleteQuestion)

// router.post("/new",getAccessToRoute,checkPermission("question","delete"),question.newQuestion)
router.put("/update-solved",getAccessToRoute,question.updateSolved)

router.get('/questions' , getAccessToRoute,question.getQuestionsOfUser)

router.get('/questions/all' , question.getAllQuestions)
module.exports = router;