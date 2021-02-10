
const Question = require("../../models/Question")
const {tokenExist,getTokenFromHeader} = require("../token/token");
const User = require("../../models/User")
const jwt = require("jsonwebtoken");

const checkSlug = async function(slug){
    try{
        let question = await Question.findOne({slug:slug})
        if(question){
            const slug = question.slug.split("-")
            if(typeof parseInt(slug[slug.length-1]) == 'number' ){
                slug = parseInt(slug[slug.length-1]) + 1;
            }
        }
        return slug
    }
    catch(error){
        return false
        return next(new CustomError("Soru oluşturulamadı",500))
    }
}
const getUserOnJWT = async(req)=>{
    try{
        if(!tokenExist(req)) return false
        const secretKey = process.env.JWT_SECRET_KEY 
        const  token = getTokenFromHeader(req)
        return jwt.verify(token,secretKey,(err,decoded)=>{
            if(err){
                return false
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
                }      
            })
        })
    }
    catch(error){
        console.log("h=",error.message)
        return false;
    }
   
}


module.exports = {
    checkSlug,
    getUserOnJWT
}