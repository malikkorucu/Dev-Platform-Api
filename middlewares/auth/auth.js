const CustomError = require("../../helpers/error/CustomError");
const jwt = require("jsonwebtoken");
const {tokenExist,getTokenFromHeader} = require("../../helpers/token/token");
const axios = require("axios");
const { stat } = require("fs");
const User = require("../../models/User")

const getAccessToRoute = async (req,res,next)=>{
    if(!tokenExist(req)) return next(new CustomError("Buraya işlemi gerçekleştirebilmek için giriş yapmalısınız.1",200))
    const secretKey = process.env.JWT_SECRET_KEY 
    const  token = getTokenFromHeader(req)
    jwt.verify(token,secretKey,(err,decoded)=>{
        if(err){
            return next(new CustomError("Buraya işlemi gerçekleştirebilmek için giriş yapmalısınız.2",200))
        }
        return User.findById(decoded.id).populate("role","+employee_permission")
        .then(user=>{
            if(!user) return next(new CustomError("Kullanıcı Bulunamadı",400))
            else{
                 req.user = {
                    id: decoded.id,
                    username: decoded.username,
                    name: decoded.name,
                    surname: decoded.surname,
                    role: user.role,
                }
                next();
            }      
        })
    })

}
const checkGoogleAuth = async (req,res,next)=>{
    if(!req.body.token) return next(new CustomError("Token Bulunamadı!"));
    const url = "https://www.google.com/recaptcha/api/siteverify?secret="+process.env.CAPTCHA_SECRET_KEY+'&response='+req.body.token;
    let requestGoogle = await axios.post(url);
    if(requestGoogle.data.success === false){
        return next(new CustomError("Google tarafından sağlanan captcha doğrulanamadı",403))
    }
    next();
}
const checkPermission = function(permission,action,type='user'){
    if(!permission || !action) return next(new CustomError("Güvenlik kontrolü sağlanamadı",400))
    return async function(req, res, next) {
        if(!req.user.role) return next(new CustomError("Güvenlik Kontrolü kullanıcıdan dolayı sağlanamadı",401))
        else if(type === 'employee'){
            if(req.user.role.isEmployee && req.user.role.employee_permission[permission] && req.user.role.employee_permission[permission][action]) return next();
            else return next(new CustomError("Yetkisiz çalışan işlemi",401))
        }
        else if (type === 'user'){
            if(req.user.role.user_permission[permission] && req.user.role.user_permission[permission][action]) return next();
            else return next(new CustomError("Yetkisiz kullanıcı işlemi",401))
        }else{
            return next(new CustomError("Güvenlik Kontrolü Sağlanamadı",401))
        }
      }
}
module.exports = {
    getAccessToRoute,
    checkGoogleAuth,
    checkPermission
}