const express = require("express");
const app = express();
var cors = require('cors')
const bodyParser= require("body-parser")
const helmet = require("helmet")
const errorHandler = require("./middlewares/errors/errorHandler");
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(helmet());
app.use(express.json());
require("dotenv").config({
    path: "./config/config.env"
});

const mainRoutes = require("./routes/index");
 
app.use("/api/v1",mainRoutes)
app.use(errorHandler);
app.use((req,res,next)=>{
    res.status(404).json({
        success: false,
        message: "Sayfa bulunamadı veya yetkiniz yok"
    })
})
const mongoose = require("mongoose");

// mongoose.connect(process.env.MONGO_URI,{
//     useNewUrlParser: true,
//     useUnifiedTopology: true, 
//     useCreateIndex: true,
//     autoIndex: true,
// })
mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useCreateIndex: true,
    autoIndex: true, //this is the code I added that solved it all
    keepAlive: true,
    poolSize: 10,
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    useFindAndModify: false,
    useUnifiedTopology: true
})

.then(()=>{
    console.log("Database: ON")
})
.catch((err)=>{
    console.log("Database: ",err.message)
    // next(err);
})

// dosya işlemleri
const path = require("path");
app.use('/static', express.static(path.join(__dirname, 'public/uploads')))

app.listen(process.env.PORT,()=>{
    console.log("SERVER:" + process.env.PORT);
});


