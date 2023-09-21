const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    user_mail: String,
    user_name: String,
    user_role: String,
    user_status: String,
    user_pic: String,
    login_id: String,
    password: String,
    author_bio: String,
    facebook_link: String,
    twitter_link: String,
    instagram_link: String,
    linkedin_link: String,
    tag_line: String,
    author_code: String,
    update_date: String
});

module.exports = mongoose.model('users_role', roleSchema, 'users_role');