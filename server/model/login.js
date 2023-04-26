const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username:{
        type: String,
        required: 'Yes'
    },
    password:{
        type: String,
        required: 'Yes'
    }
});

module.exports = mongoose.model('authAdmins', adminSchema, 'authAdmin');