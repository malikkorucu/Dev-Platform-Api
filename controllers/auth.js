const asyncHandler = require('express-async-handler');
const CustomError = require("../helpers/error/CustomError");

const User = require('../models/User');
const Role = require('../models/Role');
const {sendTokenToClient} = require("../helpers/token/token");
const {comparePassword} = require("../helpers/input/input");


exports.registerUser = asyncHandler(async(req,res,next)=>{
    const {username,email,password,name,surname,phone} = req.body;
    if(!username) return next(new CustomError("Kullanıcı Adı Bulunamadı",400))
    else if (!email) return next(new CustomError("Email Bulunamadı",400))
    else if(!password) return next(new CustomError("Şifre Bulunamadı",400))
    else if(!name) return next(new CustomError("Ad Bulunamadı",400))
    else if(!surname) return next(new CustomError("Soyad Bulunamadı",400))
    else if(!phone) return next(new CustomError("Telefon Numarası Bulunamadı",400))

    const defaultUserRole = await Role.findOne({defaultUser: true});
    let user = new User({
        username,
        email,
        password,
        name,
        surname,
        phone,
        role: defaultUserRole?defaultUserRole._id:null
    });
    user = await user.save(); 
    return sendTokenToClient(user,res,200);
})
exports.loginUser = asyncHandler(async(req,res,next)=>{
    // const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // api heryerde kontrol edilecek
    const {email,username,password} = req.body;
    let user = null;
    // const status = emailOrUserName.split("").includes("@")?true:false

    if(email){
        user = await User.findOne({email}).select("+password");
    }
    else if(username){
        user = await User.findOne({username}).select("+password")
    }
    else{
        return next(new CustomError("Kullanıcı Adı veya Mail Alanı Boş",400))
    }
    if(!user) return next(new CustomError("Kullanıcı Bulunamadı",400))
    if(!comparePassword(password,user.password)){
        return next(new CustomError("Kullanıcı adı veya şifre yanlış",200))
    }
    return sendTokenToClient(user,res,200);
})


exports.logout = (req,res,next)=>{
    const {NODE_ENV} = process.env;
    return res.status(200).cookie({
        httpOnly: true,
        expires: new Date(Date.now()),
        secure: NODE_ENV === "development" ? false : true
    }).json({
        success: true,
        message: "Logout Successful"
    })

}
exports.profile = (req,res,next)=>{
    const id = req.user;
    res.status(200).json({
        success: true,
        data: id
    })
}

exports.forgotPassword = async (req,res,next)=>{
    const resetEmail = req.body.email;
    if(!resetEmail) return next (new CustomError("Bir email girilmesi gerekmektedir",200))
    const user = await User.findOne({email:resetEmail})
    if(!user) return next (new CustomError("Bu emaile ait kullanıcı bulunamadı",400))
    const token = await user.getResetPasswordToken();
    await user.save();
    const resetPasswordUrl = "https://localhost:3000/reset-password?token="+token;
    const emailTemplate = `
        <h2>Oyunboss | Şifre Sıfırlama Talebi</h2>
        <p>Oyunboss.com sitesine kayıt olduğunuz şifre sıfırlama talebi başarıyla ulaştı. Aşağıdaki bağlantıyı kullanarak şifrenizi sıfırlayabilirsiniz</p>
        <a target="_blank"  href="${resetPasswordUrl}">Şifre Sıfırlama Bağlantısı</a>
        <small>Dikkat: Oluşturulan bağlantı sadece '1' saat kullanılabilir.</small>
    `
    try{
        await sendEmail({
            from: process.env.SMTP_EMAIL,
            to: resetEmail,
            subject: "Oyunboss | Şifre sıfırlama bağlantısı oluşturuldu",
            html: emailTemplate
        })
        return res.status(200).json({
            success: true,
            data: "Şifre sıfırlama bağlantısı mail adresinize gönderildi.",
        })
    }
    catch(err){
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        await user.save();
        return next(new CustomError(err.message,500))
        
    }
}
exports.checkToken = async(req,res,next)=>{
    const token = req.params.token;
    if(!token) return next(new CustomError("Token bulunamadı",400))
    let user = null;
    try{
        user = await User.findOne({
            resetPasswordToken:token,
            resetPasswordExpire: {$gt:Date.now()}
        });
    }catch(err){
        next(err.message)
    }
    if(!user || user.length<=0) return next(new CustomError("Token Bulunamadı veya Süresi Dolmuş",200));
    res.status(200).json({
        success: true,
        data: user
    })
}
exports.resetPassword = async(req,res,next)=>{
    let newPassword = req.body.password;
    if(!newPassword) return next(new CustomError("Bir şifre sağlayın",400))
    const token = req.params.token;
    const username = req.body.username;
    const userFind = await User.findOne({
        resetPasswordToken:token,
        resetPasswordExpire: {$gt:Date.now()},
        username: username
    })
    if(!userFind || userFind.length<=0) return next(new CustomError("Kullanıcı bulunamadı veya süresi dolmuş",200));
    userFind.password = newPassword;
    userFind.resetPasswordToken = null;
    userFind.resetPasswordExpire = null;
    await userFind.save();
    res.status(200).json({
        success: true,
        data: "Şifre başarıyla sıfırlandı!"
    })
    
}
