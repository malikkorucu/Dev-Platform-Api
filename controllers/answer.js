const asyncHandler = require('express-async-handler');
const CustomError = require("../helpers/error/CustomError");
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const { getUserOnJWT } = require("../helpers/function/index");
exports.newAnswer = asyncHandler(async (req, res, next) => {
    const { questionId, text } = req.body;
    if (!questionId) return next(new CustomError("Soru için gerekli parametre gelmedi", 400))
    else if (!text) return next(new CustomError("Bu soruya bir cevap gelmedi", 400))
    const question = await Question.findById(questionId)
    if (!question) return next(new CustomError("Soru Bulunamadı", 404))
    if (question.isClosed) return next(new CustomError("Kapanmış bir soruya cevap veremezsiniz", 400));

    let answer = await Answer.create({
        question: questionId,
        user: req.user.id,
        text
    })

    let data = await answer.populate("user").execPopulate()

    res.status(200).json({
        success: true,
        data
    })
})

exports.updateAnswer = asyncHandler(async (req, res, next) => {
    const { answerId, text } = req.body;
    if (!answerId) return next(new CustomError("Cevap düzenlemek için gerekli parametre gelmedi", 400));
    let answer = await Answer.findOne({ _id: answerId, user: req.user.id });
    if (!answer) return next(new CustomError("Bu cevap size ait değil!", 401));
    if (answer.isTrueAnswer) return next(new CustomError("Bu cevap doğru olarak işaretlendiği için içeriği değiştiremezsiniz", 400));
    answer.text = text;
    answer = await answer.save();
    res.status(200).json({
        success: true,
        data: answer
    })
})

exports.deleteAnswer = asyncHandler(async (req, res, next) => {
    const { answerId } = req.body;
    if (!answerId) return next(new CustomError("Cevap düzenlemek için gerekli parametre gelmedi", 400));
    let answer = await Answer.findOne({ _id: answerId, user: req.user.id });
    if (!answer) return next(new CustomError("Cevap Bulunamadı", 404));
    if (answer.isTrueAnswer) return next(new CustomError("Bu cevap doğru olarak işaretlendiği için silemezsiniz", 400));
    await Answer.findByIdAndDelete(answerId)
    res.status(200).json({
        success: true
    })
})

exports.getQuestionAnswers = asyncHandler(async (req, res, next) => {
    const { shortId,slug } = req.params;
    const question = await Question.findOne({shortId,slug});
    let questionId = question._id;
    await getUserOnJWT(req)
    let answers = null;
    if (req.user) {
        answers = await Answer.find({ question: questionId }).limit(10).select("+positive +negative").populate("user").lean();
        answers.forEach(element => {
            if (element.positive.includes(req.user.id)) {
                element["userVote"] = "up"
            }
            else if (element.negative.includes(req.user.id)) {
                element["userVote"] = "down"
            }
            if (JSON.stringify(element.user._id) === JSON.stringify(req.user.id)) {
                element.isOwnAnswer = true;
            }
            element.negative = undefined;
            element.positive = undefined;
            return true
        })
    } else {
        answers = await Answer.find({ question: questionId }).limit(10).populate("user").lean()
    }
    return res.status(200).json({
        success: true,
        data: answers
    })
})

exports.updateVote = asyncHandler(async (req, res, next) => {
    const { action, answerId } = req.body;
    if (!action || !answerId) return next(new CustomError("Eksik bilgi", 400));
    let answer = await Answer.findById(answerId).select("+positive +negative");
    if (!answer) return next(new CustomError("Cevap Bulunamadı", 404))
    if (JSON.stringify(answer.user) === JSON.stringify(req.user.id)) return next(new CustomError("Kendi yorumunuza oy veremezsiniz", 403));

    let updateStatus = false;
    const tempAnswer = answer;
    const tempAnswerPositive = answer.positive.length;
    const tempAnswerNegative = answer.negative.length;
    if (action === 'up') {
        answer.negative.pull(req.user.id)
        answer.positive.addToSet(req.user.id)
    }
    else if (action === 'down') {
        answer.positive.pull(req.user.id);
        answer.negative.addToSet(req.user.id);
    }
    else {
        return next(new CustomError("Aksiyon alınamadı", 400))
    }
    if (tempAnswerNegative == answer.negative.length && tempAnswerPositive == answer.positive.length) updateStatus = false
    else updateStatus = true;
    answer.vote = parseInt(answer.positive.length - answer.negative.length);
    await answer.save();
    res.status(200).json({
        success: true,
        changeStatus: updateStatus
    })
})
