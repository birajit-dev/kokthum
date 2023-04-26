const mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);

const pageSchema = new mongoose.Schema({
    id:{
        type: Number,
    },
    category:{
        type: String,
        required: 'Yes'
    },
    title:{
        type: String
    },
    description:{
        type:String
    },
    imageName:{
        type:String
    },
    publishedAt:{
        type:String
    },
    content:{
        type:String
    },
    ibns_id:{
        type:String
    }
});

pageSchema.plugin(AutoIncrement, {id:'id',inc_field: 'id'});
module.exports = mongoose.model('ibns', pageSchema);