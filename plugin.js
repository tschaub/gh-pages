var ghPages = require('./lib/index')
var path = require('path')

module.exports = function (pluginConfig, config, callback) {
  ghPages.publish(path.join(__dirname, config.basePath), config, callback)
}
