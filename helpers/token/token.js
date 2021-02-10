// const User = require("../../models/User")
const sendTokenToClient =  (user,res,status) => {
    const token =  user.getToken();
    const {JWT_COOKIE_EXPIRE,NODE_ENV} = process.env;
    return res
    .status(status)
    .cookie("token",token, {
        httpOnly : true,
        expires : new Date(Date.now() +  parseInt(JWT_COOKIE_EXPIRE) * 1000 * 60),
        secure : NODE_ENV === "development" ? false : true
    })
    .json({
        success : true,
        token,
        expiredDate:new Date(Date.now() +  parseInt(JWT_COOKIE_EXPIRE) * 1000 * 60),
        data : {
            id: user.id,
            username : user.username,
            email : user.email,
            role: user.role,
            name: user.name,
            surname: user.surname
        }
    });
}

const tokenExist = (req) =>{
    return( req.headers.authorization && req.headers.authorization.startsWith("Bearer:"))
}
const getTokenFromHeader = (req)=>{
    const authorization = req.headers.authorization;
    const token = authorization.split(" ")[1]
    return token


}
module.exports = {
    sendTokenToClient,
    tokenExist,
    getTokenFromHeader
};