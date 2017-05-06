var chai = require('chai');
var sinon = require('sinon');


/** @type {boolean} */
chai.config.includeStack = true;


/**
 * Chai's assert function configured to include stacks on failure.
 * @type {function}
 */
exports.assert = chai.assert;

/**
 * Sinon's spy function
 * @type {function}
 */
exports.spy = sinon.spy

/**
 * Sinon's stub function
 * @type {function}
 */
exports.stub = sinon.stub

/**
 * Sinon's mock function
 * @type {function}
 */
exports.mock = sinon.mock


/**
 * Sinon's API object
 * @type {object}
 */
exports.sinon = sinon

/**
 * Turn of maxListeners warning during the tests
 * See: https://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
 */
require('events').EventEmitter.prototype._maxListeners = 0;

