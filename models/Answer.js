const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const scheme = new Schema({
    createdDate:{
        type: Date,
        default: Date
    },
    updatedDate:{
        type: Date
    },
    question:{
        type: mongoose.Schema.ObjectId,
        ref: "question"
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true
    },
    positive:{
        type: Array,
        default: [],
        select: false
    },
    negative:{
        type: Array,
        default: [],
        select: false
    },
    vote:{
        type: Number
    },
    isTrueAnswer:{
        type: Boolean,
        default: false
    },
    isCensored:{
        type: Boolean,
        default: false
    },
    censoredAnswer:{ // sansürlenirse cevap buraya aktarılacak ve kullanıcıya iletilmeyecek
        type: String,
        select: false
    },
    text:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model("answer",scheme);
