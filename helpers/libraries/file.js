const fs = require("fs");
const path = require("path")
const deleteFile = async (pathDir,file) => {
    const rootDir = path.dirname(require.main.filename);
    const rootPath = rootDir + "/public/uploads/"
    pathDir = rootPath + pathDir;
    file = pathDir + '/' + file;
    fs.unlink(file, function (err) {
        if (err) return false
        return true;
    }); 
 
};

const moveFile = async (oldPath,newPath,file,folderCreate=true) => {
    const rootDir = path.dirname(require.main.filename);
    const rootPath = rootDir + "/public/uploads/"
    oldPath = rootPath + oldPath;
    newPath = rootPath + newPath;
    if(folderCreate){
        fs.mkdirSync(newPath, { recursive: true })
    }
    fs.rename(oldPath, newPath +'/'+file, function (err) {
    if (err) return false
    })
};

module.exports = {moveFile,deleteFile};