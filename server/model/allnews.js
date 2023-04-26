const mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);


const followUser = new mongoose.Schema({
    news_id:{
        type: Number,
    },
    post_name:{
        type: String,
        required: 'Yes'
    },
    post_url:{
        type: String
    },
    post_summary:{
        type:String
    },
    post_content:{
        type:String
    },
    post_keyword:{
        type:String
    },
    meta_description:{
        type:String
    },
    post_category:{
        type:String
    },
    post_image:{
        type:String
    },
    meta_tags:{
        type:String
    },
    post_topic:{
        type:String
    },
    post_editor:{
        type:String
    },
    ne_insight:{
        type:String
    },
    author:{
        type:String
    },
    ibns_id:{
        type:String
    },
    update_date:{
        type:String
    }
    

});

followUser.plugin(AutoIncrement, {id:'news_seq',inc_field: 'news_id'});
module.exports = mongoose.model('allposts', followUser, 'allpost');