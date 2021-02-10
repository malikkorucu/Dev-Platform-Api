const asyncHandler = require('express-async-handler');
const CustomError = require("../helpers/error/CustomError");
const Question = require('../models/Question');
const Answer = require('../models/Answer');


exports.newQuestion = asyncHandler(async(req,res,next)=>{
    const {text,title,keywords} = req.body;
    if(!text) return next(new CustomError("Soru içeriği bulunamadı",400))
    else if(!title) return next(new CustomError("Soru içeriği bulunamadı",400));
    let question = await Question.create({
        text,
        keywords,
        title,
        user:req.user.id
    })
    question = await question.populate("user").execPopulate()
    return res.status(200).json({
        success: true,
        data: question
    })
})

exports.updateQuestion = asyncHandler(async(req,res,next)=>{
    const {text,keywords,shortId} = req.body;
    if(!text) return next(new CustomError("Soru içeriği bulunamadı",400))
    let question = await Question.findOne({shortId,user:req.user.id});
    if(!question) return next(new CustomError("Bu soru size ait değil!",401));
    question.text = text;
    question.keywords = keywords;
    question = await question.save();
    res.status(200).json({
        success: true,
        data: question
    })
})

exports.getQuestionBySlug = asyncHandler(async(req,res,next)=>{
    const {id,slug} = req.params;
    let shortId = id;
    if(!shortId || !slug) return next(new CustomError("Soru için gerekli bilgiler gelmedi",400));
    let question = await Question.findOne({slug,shortId}).populate("user");
    if(!question) return next(new CustomError("Soru Bulunamadı",404));
    question.stats.viewer +=1;
    question = await question.save();
    const answerCount = await Answer.find({question:question._id}).countDocuments();
    let followerCount = await Question.findOne({slug,shortId}).select("followers").lean();
    followerCount = followerCount.followers.length;
    res.status(200).json({
        success: true,
        data: {question,answerCount,followerCount},
    })
})

exports.deleteQuestion = asyncHandler(async(req,res,next)=>{
    const {shortId} = req.body;
    if(!shortId) return next(new CustomError("Silinecek soru için gerekli bilgi gelmedi",400));
    let question = await Question.findOneAndDelete({shortId,user:req.user.id});
    if(!question) return next(new CustomError("Bu soru size ait değil!",401));
    res.status(200).json({
        success: true
    })
})

exports.updateSolved = asyncHandler(async(req,res,next)=>{
    const {shortId,answerId} = req.body;
    if(!shortId) return next(new CustomError("Soru için gerekli bilgi gelmedi",400));
    let question = await Question.findOne({shortId,user:req.user.id});
    if(!question) return next(new CustomError("Bu soru size ait değil!",401));
    let answer = await Answer.findOne({question:question._id,_id:answerId});
    if(!answer) return next(new CustomError("Cevap Bulunamadı",404))
    if(question.user == answer.user) return next(new CustomError("Kendi cevabınızı doğru olarak işaretleyemezsiniz",400))
    let recentTrueAnswer = await Answer.findOne({question:question._id,})
    question.isSolved = true;
    answer.isTrueAnswer = true;
    question = await question.save();
    answer = await answer.save();
    res.status(200).json({
        success: true,
        data:{
            question,
            answer
        }
    })
})

exports.getAllQuestions = asyncHandler(async(req,res,next)=> {

    const questions = await Question.find({}).populate("user")

    res.status(200).json({
        success:true,
        data:questions
    })
})

exports.getQuestionsOfUser = asyncHandler(async(req,res,next)=> {
    const questions = await Question.find({user:req.user.id}).populate("user")

    res.status(200).json({
        success:true,
        data:questions
    })
})

exports.updateNotification = asyncHandler(async(req,res,next)=>{
    const {questionId} = req.body;
    if(!answerId) return next(new CustomError("Eksik bilgi",400));
    let answer = await Answer.findById(answerId).select("+followers");
    if(!answer) return next(new CustomError("Cevap Bulunamadı",404))
    let action = null;
    if(answer.followers.includes(req.user.id)){
        action = "delete";
    }else action = "add"
    if(action === 'add'){
        answer.followers.addToSet(req.user.id)
    }
    else if(action === 'delete'){
        answer.followers.pull(req.user.id);
    }
    else{
        return next(new CustomError("Aksiyon alınamadı",400))
    }
    await answer.save();
    res.status(200).json({
        success: true,
        action
    })
})