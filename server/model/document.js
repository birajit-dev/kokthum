const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    file_name: { type: String, required: true },
    file_path: { type: String, required: true },
    domain_owner: String,
    domain_key: String,
    domain_name: String,
    uploaded_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Document', DocumentSchema);
