/* eslint-env mocha */

var ghpages = require('../../lib/index');
var stub = require('../helper').stub;
var assert = require('../helper').sinon.assert;
var cli = '../../bin/gh-pages'

describe('gh-pages', function() {
  beforeEach(function() {
    stub(ghpages, 'publish')
  })

  afterEach(function() {
    ghpages.publish.restore()
  })

  var publish = function(dist, args) {
    process.argv = ['node', 'gh-pages', '-d', dist].concat(args)
    require(cli);
    delete require.cache[require.resolve(cli)]
  }

  var defaults = {
    repo: undefined,
    silent: false,
    branch: 'gh-pages',
    src: '**/*',
    message: 'Updates',
    dotfiles: false,
    add: false,
    remote: 'origin',
    push: true
  }

  var scenarions = [
    ['-d lib',         defaults],
    ['-d lib -n',      {push: false}],
    ['-d lib -x',      {silent: true}],
    ['-d lib -t',      {dotfiles: true}],
    ['-d lib -a',      {add: true}]
  ]

  scenarions.forEach(function(scenario) {
    var args = scenario[0].split(' ')
    var config = scenario[1]
    var dist = args[1]

    it(args.join(' '), function() {
      publish(dist, args)
      assert.calledWithMatch(ghpages.publish, dist, config);
    })
  })
});
