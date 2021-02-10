const express = require("express");
const { getAccessToRoute,checkPermission } = require("../middlewares/auth/auth");
const router = express.Router();
const answer = require("../controllers/answer");


// router.post("/new",getAccessToRoute,checkPermission("answer","create"),question.newQuestion)
router.post("/new",getAccessToRoute,answer.newAnswer)

// router.post("/new",getAccessToRoute,checkPermission("answer","update"),question.newQuestion)
router.put("/update",getAccessToRoute,answer.updateAnswer)

// router.post("/new",getAccessToRoute,checkPermission("answer","read"),question.newQuestion)
// router.post("/get/:slug/:id",getAccessToRoute,answer.getAnswerBySlug)

// router.post("/new",getAccessToRoute,checkPermission("answer","delete"),question.newQuestion)
router.delete("/delete",getAccessToRoute,answer.deleteAnswer)

// router.post("/new",getAccessToRoute,checkPermission("question","delete"),question.newQuestion)
router.put("/update-vote",getAccessToRoute,answer.updateVote)

router.get("/question/:slug/:shortId",answer.getQuestionAnswers)
module.exports = router;