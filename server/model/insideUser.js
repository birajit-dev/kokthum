const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    user_mail:{
        type: String,
    },
    user_name:{
        type: String,
    },
    user_role:{
        type: String,
    },
    user_status:{
        type:String,
    },
    user_pic:{
        type:String,
    },
    login_id:{
        type: String,
        required: 'Yes'
    },
    login_pass:{
        type: String,
        required: 'Yes'
    },
    author_bio:{
        type: String
    }
});

module.exports = mongoose.model('users_role', roleSchema, 'users_role');