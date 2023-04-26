const mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);

const pageSchema = new mongoose.Schema({
    gallery_id:{
        type: Number,
    },
    gallery_title:{
        type: String,
        required: 'Yes'
    },
    gallery_path:{
        type: Array
    },
    gallery_keyword:{
        type:String
    },
    gallery_description:{
        type:String
    },
    gallery_url:{
        type:String
    },
    update_date:{
        type:String
    }

});

pageSchema.plugin(AutoIncrement, {id:'gallery_id',inc_field: 'gallery_id'});
module.exports = mongoose.model('gallery', pageSchema);