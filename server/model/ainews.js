const mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
const newsSchema = new mongoose.Schema({
    news_id: Number,
    post_name: String,
    post_url: String,
    post_description: String,
    post_content: String,
    post_keyword: String,
    post_category: String,
    post_image: String,
    image_source: String,
    meta_tags: String,
    author_key: String,
    author_name: String,
    post_status: String,
    domain_owner: String,
    domain_key: String,
    domain_name: String,
    top_news: String,
    editorial_news: String,
    breaking_news: String,
    headline_news: String,
    optional_1: String,
    optional_2: String,
    optional_3: String,
    optional_4: String,
    update_date: String,
});

newsSchema.plugin(AutoIncrement, {id:'ai_seq',inc_field: 'ai_seq'});
module.exports = mongoose.model('ainews', newsSchema, 'ainews');