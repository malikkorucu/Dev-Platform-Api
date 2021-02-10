const CustomError = require("../../helpers/error/CustomError"); 
const customErrorHandler = (err,req,res,next)=>{
    console.log(err)
    let customError = new CustomError(err.message,err.status);

    res.status(customError.status || 500).json({
        success: false,
        message: customError.message || "Internatial Server Error",
        status: customError.status || 500
    })
};

module.exports = customErrorHandler;