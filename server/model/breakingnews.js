const mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);

const pageSchema = new mongoose.Schema({
    brnews_id:{
        type: Number,
    },
    breaking_title:{
        type: String,
        required: 'Yes'
    },
    breaking_keyword:{
        type:String
    },
    breaking_url:{
        type:String
    },
    update_date:{
        type: String
    },
});

pageSchema.plugin(AutoIncrement, {id:'brnews_id',inc_field: 'brnews_id'});
module.exports = mongoose.model('breakingnews', pageSchema);