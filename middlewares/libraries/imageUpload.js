
const multer = require("multer");
const path = require("path");
const CustomError = require("../../helpers/error/CustomError");
const fs = require("fs");




const storage = multer.diskStorage({
    destination : async function(req,file,cb) {
        const rootDir = path.dirname(require.main.filename);
        // const uploadDir = "/public/uploads"
        // fs.mkdirSync(rootDir+uploadDir+'/'+req.folder_name, { recursive: true })
        cb(null,path.join(rootDir,"/public/uploads/"));
    },
    filename : function(req,file,cb){
        const extension = file.mimetype.split("/")[1];
        if(!req.savedImage) req.savedImage = [];
        let savedImage = (file.originalname.split(".")[0] + "-"+  Date.now() + "."  + extension)
        req.savedImage.push( savedImage);
        cb(null,savedImage);
    }

});

const fileFilter = (req,file,cb) => {
    allowedTypes = ["image/jpg","image/gif","image/jpeg","image/png"];

    if (!allowedTypes.includes(file.mimetype)){
        return cb(new CustomError("Lütfen sadece jpg,gif,png veya jpeg dosya yükleyin.",400),false);
    }
    return cb(null,true);

}

const photoUpload = multer({storage,fileFilter});


module.exports = photoUpload;