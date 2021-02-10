const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// yeni üye , banlı üye
const scheme = new Schema({
    date:{
        type: Date,
        default: Date.now()
    },
    role: { //müşteri,kullanıcı,eski müşteri
        type: String,
        required: true
    },
    userDefault:{
        type: Boolean,
        default: false,
        required: true
    },
    isEmployee:{
        type: Boolean,
        default: false,
        required: true
    },
    user_permission:{
        type: {
            question:{
                type:{
                    create:{
                        type: Boolean
                    },
                    read:{
                        type: Boolean
                    },
                    update:{
                        type: Boolean
                    },
                    delete:{
                        type: Boolean
                    }
                }
            },
        },
        required: true
    },
    employee_permission:{
        type: {
            question:{
                type:{
                    create:{
                        type: Boolean
                    },
                    read:{
                        type: Boolean
                    },
                    update:{
                        type: Boolean
                    },
                    delete:{
                        type: Boolean
                    }
                }
            },
            role:{
                type:{
                    create:{
                        type: Boolean
                    },
                    read:{
                        type: Boolean
                    },
                    update:{
                        type: Boolean
                    },
                    delete:{
                        type: Boolean
                    }
                }
            }
        },
        select: false,
    },

})
module.exports = mongoose.model("role",scheme);
