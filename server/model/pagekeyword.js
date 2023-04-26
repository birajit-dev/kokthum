const mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);


const pageKeyword = new mongoose.Schema({

    page_id:{
        type: Number,
        required:'yes'
    },
    page_category:{
        type: String
    },
    page_keyword:{
        type: String
    },
    page_summary:{
        type:String
    },
    update_date:{
        type:String
    }

});


pageKeyword.plugin(AutoIncrement, {id:'page_seq',inc_field: 'page_id'});


module.exports = mongoose.model('pageseos', pageKeyword, 'pageseo');