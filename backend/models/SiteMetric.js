const mongoose = require('mongoose');

const siteMetricSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'global',
    unique: true
  },
  totalVisits: {
    type: Number,
    default: 0
  },
  visitedBy: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('SiteMetric', siteMetricSchema);
