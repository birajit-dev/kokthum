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
    update_date: String
});

module.exports = mongoose.model('users_role', roleSchema, 'users_role');