const mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);

const pageSchema = new mongoose.Schema({
    video_id:{
        type: Number,
    },
    video_key:{
        type: String,
        required: 'Yes'
    },
    update_date:{
        type:String
    }
});

pageSchema.plugin(AutoIncrement, {id:'video_id',inc_field: 'video_id'});
module.exports = mongoose.model('videos', pageSchema);