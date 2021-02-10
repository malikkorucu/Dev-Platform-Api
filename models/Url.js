const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CustomError = require("../helpers/error/CustomError")
// const slugify = require('slugify')

const validate = require('mongoose-validator')
 
// const urlValidator = [
//   validate({
//     validator: 'isUrl',
//     message: "Only URL's can be shortened.",
//   }),
// ]
const urlValidator = [
    validate({
        validator: 'matches',
        arguments: /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/,
      })
  ]

  // stats kısmında olacak

const scheme = new Schema({
    created_date:{
        type: Date,
        default: Date.now()
    },
    updated_date:{
        type: Date
    },
    created_by:{
        type: mongoose.Schema.ObjectId,
        ref: "user"
    },
    custom:{
        type: {
            prefix: {
                type: Boolean,
                default: false
            },
            id:{
                type: String,
            }
        },
        default: {
            prefix: false,
            id: null
        }
    },
    long_url:{
        type: String,
        validate:urlValidator
    },
    short_url:{
        type: String,
        validate: urlValidator
    },
    short_id:{
        type: String,
        unique: true
    },
    total_clicks:{
        type: Number,
        default: 0,
        select: false
    },
    referrers:{
        type: [
            {
                referrer:{
                    type: String
                },
                count:{
                    type: Number
                }
            }
        ],
        select: false
    },
    geography:{
        type:[
            {
                country:{
                    type: String
                },
                count:{
                    type: Number
                }
            }
        ],
        select: false
    }
})



scheme.pre("save",async function(next){
    if(!this.isModified("long_url")){
        return next();
    }
    if(this.custom.id) this.short_id = this.custom.id
    // else this.short_id = await this.makeUniqueId();
    else this.short_id = this.makeUniqueId();
    if(!this.short_id) return next(new CustomError("Short Id can't created",500));
    if(this.custom.prefix) this.short_url = process.env.BASE_URL + "/"+this.prefix+"/"+this.custom.id?this.custom.id:this.short_id;
    else this.short_url = process.env.BASE_URL + "/"+(this.custom.id?this.custom.id:this.short_id);
    next();
})

scheme.methods.makeUniqueId =function(){
    const lowerAlph = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    const upperCaseAlp = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    const numbers = [1,2,3,4,5,6,7,8,9,0];
    const randomList = [...lowerAlph,...upperCaseAlp,...numbers];
    let random = "";
    for (let x = 0; x < 6; x++){
        const item = randomList[Math.floor(Math.random() * randomList.length)];
        random += item;
    }
    return random;

    
    // return slugify(this.name,{
    //     replacament: "-",
    //     remove:/[*+~.()'"!:@]/g,
    //     lower:true
    // })

}


module.exports = mongoose.model("url",scheme);
