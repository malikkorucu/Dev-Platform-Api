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
    slug:{
        type: String,
        // unique: true,
        slug: "title",
        // slugPaddingSize: 1,
    },
    shortId:{
        type: Number,
        unique: true
    },
    title:{
        type: String,
        required: true
    },
    text:{
        type: String,
        required: true
    },
    isSolved:{
        type: Boolean,
        default: false
    },
    isClosed:{
        type: Boolean,
        default: false,
    },
    keywords:{
        type: Array,
        default: []
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true
    },
    stats:{
        type:{
            viewer:{
                type: Number,
                default: 0
            }
        },
        default:{
            viewer: 0
        }
    },
    followers:{
        type:[{
            type:mongoose.Schema.ObjectId,
            ref: "user"
        }],
        select: false
    }



})
scheme.pre("save",async function(next){
    if(!this.isModified("title")){
        next();
    }
   const count = await this.constructor.countDocuments();
   this.shortId = count+1;
    // this.slug = this.makeSlug();
    // const x = this.constructor.findOne({slug: this.slug})
    // while
    // try{
    //     let question = await this.constructor.findOne({slug:this.slug})
    //     if(question){
    //         let slug = question.slug.split("-")
    //         console.log("Slug_1=",slug)
    //         slug = parseInt(slug[slug.length-1]);
    //         console.log("Slug=",slug)
    //         if(slug){
    //             console.log("var")
    //             this.slug =  this.slug + +"-"+(slug + 1);
    //         }else{
    //             console.log("yok")
    //             this.slug = slug + "-1"
    //         }
    //     }
    // }
    // catch(error){
    //     return next(new CustomError("Soru oluşturulamadı",500))
    // }
    // const lastSlug = await checkSlug(this.slug);
    // if(!lastSlug) return next(new CustomError("Soru oluşturulamadı",500));
    // this.slug = lastSlug

    next();

})
scheme.methods.makeSlug = function(){
    return slugify(this.title,{
        replacament: "-",
        remove:/[*+~.()'"!:@]/g,
        lower:true
    })
}
module.exports = mongoose.model("question",scheme);
