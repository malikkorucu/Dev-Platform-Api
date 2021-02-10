const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken")
const crypto = require("crypto");
// const Cryptr = require('cryptr');
// const cryptr = new Cryptr(process.env.CRYPTR_SECRET_KEY);





const userSchema = new Schema({
    date:{
	type: Date,
	default: Date.now()
    },
    username:{
        type: String,
        unique: [true,"Bu kullanıcı adı alınmış"],
        required: [true,"Kullanıcı Adı zorunlu alandır"],
        minlength:[3,"Kullanıcı adınız minumum 3 karakter olmalıdır"],
        maxlength:[28,'Kullanıcı adınız maksimum 28 karakter olmalıdır'],
        lowercase: true,
        match:[
            /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{2,22}$/,
            "Kullanıcı adınız en az 3 karakter en fazla 23 karakter olmalıdır.(Birleşik Olmalıdır) "
        ]
    },
    preferences:{
        type:{
            tools:[{
                type: mongoose.Schema.ObjectId,
                ref: "tool"
            }],
            programmingLanguages:[{
                type: mongoose.Schema.ObjectId,
                ref: "tool"
            }],
            speakingLanguage:[{
                type: mongoose.Schema.ObjectId,
                ref: "tool"
            }]
        }

    },
    email: {
        type: String,
        required: [true,"Mail zorunlu alandır"],
        unique: [true,"Bu mail ile zaten kayıt var"],
        match:[
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Lütfen sadece mail giriniz"
        ],
        select: false,
        maxlength:[30,'Email adresiniz maksimum 30 karakter olmalıdır']
    },
    password:{
        type: String,
        select : false,
        minlength: [8,"Şifreniz minumum 6 karakter olmalıdır"],
        required: [true,"Şifre zorunlu alandır."]
    },
    name:{
        type: String,
        required: true,
        maxlength:[30,'Adınız maksimum 30 karakter olmalıdır']
    },
    surname:{
        type: String,
        required: true,
        maxlength:[25,'Soyadınız maksimum 25 karakter olmalıdır']
    },
    profile:{
        type:{
            isVerified: {
                type: Boolean,
                default: false,
                select: false
            },
            isEmployee: {
                type: Boolean,
                default: false,
                select: false
            },
        },
        select: false,
        default: {
            isVerified: false,
            isEmployee: false,
        }
    },
    role:{
        type: mongoose.Schema.ObjectId,
        ref:"role"
    },
    resetPasswordToken : {
        type:String,
        select: false
    },
    resetPasswordExpire: {
        type : Date,
        select: false
    },
    phone:{
        type: String,
        required: true,
        unique: [true,"Bu teleon numarasıyla daha önce kayıt olunmuş. Şifrenizi hatırlamıyorsanız 'Şifremi Unuttum' ekranından yeni şifre alabilirsiniz."],
        required: [true,"Telefon numarası zorunlu alandır"],
        // match:[
        //     /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/,
        //     'Telefon numaranızın başında 0 olmadan 1111111111 formatına uygun biçimde yazın'
        // ],
        select: false
    },
    image:{
        type: String,
        required: false
    }
})
userSchema.pre("save",function (next) {
    // if(this.isModified("phone")){
    //     const encryptedString = cryptr.encrypt(this.phone);
    //     this.phone = encryptedString
    // }
    if (!this.isModified("password")){
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) next(err);
        bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) next(err);
            this.password = hash;
            next();
        });
    });
});
userSchema.methods.getToken = function() {
    const {JWT_SECRET_KEY,JWT_EXPIRE} = process.env;
    
    const payload = {
        id : this._id,
        username : this.username,
        role: this.role,
        name: this.name,
        surname: this.surname,
    };
    const token = jwt.sign(payload, JWT_SECRET_KEY, {expiresIn : JWT_EXPIRE});
    return token;
};
userSchema.methods.getResetPasswordToken = function() {
    
    
    const randomHexString = crypto.randomBytes(15).toString("hex");

    const resetPasswordToken = crypto
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex");

    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordExpire = Date.now() + parseInt(process.env.RESET_PASSWORD_EXPIRE)

    
    return resetPasswordToken;

};
module.exports = mongoose.model("user",userSchema);
