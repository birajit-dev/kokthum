const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  subscription: {
    type: Object,
    required: true,
    validate: {
      validator: function(v) {
        return v && v.endpoint && v.keys && v.keys.p256dh && v.keys.auth;
      },
      message: 'Invalid subscription format'
    }
  },
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
});

// Update lastUsed timestamp when subscription is used
SubscriptionSchema.methods.markAsUsed = function() {
  this.lastUsed = new Date();
  return this.save();
};

// Clean up old/inactive subscriptions
SubscriptionSchema.statics.cleanupInactive = async function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    lastUsed: { $lt: thirtyDaysAgo }
  });
};

module.exports = mongoose.model('Subscription', SubscriptionSchema);
