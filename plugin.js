const path = require('path');
const ghPages = require('./lib/index.js');

module.exports = function (pluginConfig, config, callback) {
  ghPages.publish(path.join(process.cwd(), config.basePath), config, callback);
};
