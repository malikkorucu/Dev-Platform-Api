const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const Schema = mongoose.Schema;
const slugify = require('slugify')
const CustomError = require("../helpers/error/CustomError");





const scheme = new Schema({
    createdDate:{
        type: Date,
        default: Date
    },
    updatedDate:{
        type: Date
    },
    level:{
        type: Number,
        required: true,
        min:[1,"Minumum 1 olmalıdır"],
        max:[100,"Maksimum 100 olmalıdır"]
    },
    slug:{
        type: String,
        unique: true,
        slug: "title",
    },
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: false
    },
    keywords:{
        type: Array,
        default: []
    },



})
scheme.methods.makeSlug = function(){
    return slugify(this.title,{
        replacament: "-",
        remove:/[*+~.()'"!:@]/g,
        lower:true
    })
}
module.exports = mongoose.model("question",scheme);
