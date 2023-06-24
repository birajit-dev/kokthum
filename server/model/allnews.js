const mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
const newsSchema = new mongoose.Schema({
    news_id: Number,
    post_name: String,
    post_url: String,
    post_summary: String,
    post_description: String,
    post_content: String,
    post_keyword: String,
    post_category: String,
    post_image: String,
    meta_tags: String,
    insight_post: String,
    author_key: String,
    author_name: String,
    post_status: Number,
    update_date: String,
});

newsSchema.plugin(AutoIncrement, {id:'news_seq',inc_field: 'news_id'});
module.exports = mongoose.model('allposts', newsSchema, 'allpost');