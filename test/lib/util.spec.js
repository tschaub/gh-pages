const path = require('path');
const {beforeEach, describe, it} = require('mocha');
const util = require('../../lib/util.js');
const assert = require('../helper.js').assert;
const helper = require('../helper.js');

describe('util', () => {
  let files;
  beforeEach(() => {
    files = [
      path.join('a1', 'b1', 'c2', 'd2.txt'),
      path.join('a1', 'b2', 'c2', 'd1.txt'),
      path.join('a2.txt'),
      path.join('a1', 'b1', 'c1', 'd1.txt'),
      path.join('a1', 'b1', 'c2', 'd1.txt'),
      path.join('a1', 'b1.txt'),
      path.join('a2', 'b1', 'c2.txt'),
      path.join('a1', 'b1', 'c2', 'd3.txt'),
      path.join('a1', 'b2', 'c1', 'd1.txt'),
      path.join('a1.txt'),
      path.join('a2', 'b1', 'c1.txt'),
      path.join('a2', 'b1.txt'),
    ].slice();
  });

  describe('byShortPath', () => {
    it('sorts an array of filepaths, shortest first', () => {
      files.sort(util.byShortPath);

      const expected = [
        path.join('a1.txt'),
        path.join('a2.txt'),
        path.join('a1', 'b1.txt'),
        path.join('a2', 'b1.txt'),
        path.join('a2', 'b1', 'c1.txt'),
        path.join('a2', 'b1', 'c2.txt'),
        path.join('a1', 'b1', 'c1', 'd1.txt'),
        path.join('a1', 'b1', 'c2', 'd1.txt'),
        path.join('a1', 'b1', 'c2', 'd2.txt'),
        path.join('a1', 'b1', 'c2', 'd3.txt'),
        path.join('a1', 'b2', 'c1', 'd1.txt'),
        path.join('a1', 'b2', 'c2', 'd1.txt'),
      ];

      assert.deepEqual(files, expected);
    });
  });

  describe('getUser', () => {
    it('gets the locally configured user', async () => {
      const name = 'Full Name';
      const email = 'email@example.com';

      const dir = await helper.setupRepo('basic', {user: {name, email}});
      const user = await util.getUser(dir);

      assert.equal(user.name, name);
      assert.equal(user.email, email);
    });
  });
});
