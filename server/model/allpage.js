const mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);

const pageSchema = new mongoose.Schema({
    page_id:{
        type: Number,
    },
    page_title:{
        type: String,
        required: 'Yes'
    },
    page_content:{
        type: String
    },
    page_keyword:{
        type:String
    },
    page_description:{
        type:String
    },
    page_url:{
        type:String
    },
    update_date:{
        type:String
    }

});

pageSchema.plugin(AutoIncrement, {id:'page_id',inc_field: 'page_id'});
module.exports = mongoose.model('allpages', pageSchema);