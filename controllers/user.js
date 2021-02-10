const asyncHandler = require('express-async-handler');
const CustomError = require('../helpers/error/CustomError');
const User = require('../models/User');
const {moveFile,deleteFile} = require("../helpers/libraries/file");


exports.editProfile = asyncHandler(async(req,res,next)=>{
    let user = await User.findById(req.user.id);
    if(!user) return next(new CustomError("Kullanıcı Bulunamadı",404));
    // const {}
})

exports.uploadProfileImage = async(req,res,next)=>{
    try{
        let user = await User.findById(req.user.id);
        if(!user) return next(new CustomError("Kullanıcı Bulunamadı",404));
        user.image = req.savedImage[0];
        user = await user.save();
        await moveFile(user.image,'profiles/',user.image)
    }
    catch(error){
        if(req.savedImage){
            await deleteFile('/',req.savedImage[0])
        }
    }

    

}