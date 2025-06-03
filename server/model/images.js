const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    file_name: String,
    file_path: String,
    domain_owner: String,
    domain_key: String,
    domain_name: String,
    uploaded_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('image-server', ImageSchema);
