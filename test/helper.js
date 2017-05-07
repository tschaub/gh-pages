var chai = require('chai');

/** @type {boolean} */
chai.config.includeStack = true;

/**
 * Chai's assert function configured to include stacks on failure.
 * @type {function}
 */
exports.assert = chai.assert;

/**
 * Turn of maxListeners warning during the tests
 * See: https://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
 */
require('events').EventEmitter.prototype._maxListeners = 0;
