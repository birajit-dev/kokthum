const mongoose = require('mongoose');

const SaasUserSchema = new mongoose.Schema({
  saas_user: String,
  saas_email: String,
  saas_phone: String,
  saas_country: String,
  saas_company_name: String,
  saas_domain: String,
  saas_password: String, // Hash in production!
  saas_api: String,
  saas_verify: {
    type: String,
    default: 'false',
  },
  saas_key: String,
  createdat: String,
});

const SaasUser = mongoose.model('SaasUser', SaasUserSchema);

module.exports = SaasUser;
