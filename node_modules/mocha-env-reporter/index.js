'use strict';

module.exports = (process.env.BUILD_NUMBER || process.env.TEAMCITY_VERSION) ? require('mocha-teamcity-reporter') : require('mocha').reporters.spec;
