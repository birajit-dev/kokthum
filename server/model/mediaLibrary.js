const mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);

const pageSchema = new mongoose.Schema({
   media_id: Number,
   media_path: String,
   media_alt: String,
   update_date: String,
});

pageSchema.plugin(AutoIncrement, {id:'media_id',inc_field: 'media_id'});
module.exports = mongoose.model('medias', pageSchema);