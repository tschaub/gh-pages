const path = require('path');
const {assert} = require('../helper.js');
const util = require('../../lib/util.js');
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
      path.join('a2', 'b1.txt')
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
        path.join('a1', 'b2', 'c2', 'd1.txt')
      ];

      assert.deepEqual(files, expected);
    });
  });

  describe('uniqueDirs', () => {
    it('gets a list of unique directory paths', () => {
      // not comparing order here, so we sort both
      const got = util.uniqueDirs(files).sort();

      const expected = [
        '.',
        'a1',
        'a2',
        path.join('a1', 'b1'),
        path.join('a1', 'b1', 'c1'),
        path.join('a1', 'b1', 'c2'),
        path.join('a1', 'b2'),
        path.join('a1', 'b2', 'c1'),
        path.join('a1', 'b2', 'c2'),
        path.join('a2', 'b1')
      ].sort();

      assert.deepEqual(got, expected);
    });

    it('gets a list of unique directories on absolute paths', () => {
      const absoluteFiles = files.map(path => {
        return '/' + path;
      });
      // not comparing order here, so we sort both
      const got = util.uniqueDirs(absoluteFiles).sort();

      const expected = [
        '/',
        '/a1',
        '/a2',
        path.join('/a1', 'b1'),
        path.join('/a1', 'b1', 'c1'),
        path.join('/a1', 'b1', 'c2'),
        path.join('/a1', 'b2'),
        path.join('/a1', 'b2', 'c1'),
        path.join('/a1', 'b2', 'c2'),
        path.join('/a2', 'b1')
      ].sort();

      assert.deepEqual(got, expected);
    });
  });

  describe('dirsToCreate', () => {
    it('gets a sorted list of directories to create', () => {
      const got = util.dirsToCreate(files);

      const expected = [
        '.',
        'a1',
        'a2',
        path.join('a1', 'b1'),
        path.join('a1', 'b2'),
        path.join('a2', 'b1'),
        path.join('a1', 'b1', 'c1'),
        path.join('a1', 'b1', 'c2'),
        path.join('a1', 'b2', 'c1'),
        path.join('a1', 'b2', 'c2')
      ];

      assert.deepEqual(got, expected);
    });
  });

  describe('getUser', () => {
    it('gets the locally configured user', done => {
      const name = 'Full Name';
      const email = 'email@example.com';

      helper.setupRepo('basic', {user: {name, email}}).then(dir => {
        util
          .getUser(dir)
          .then(user => {
            assert.equal(user.name, name);
            assert.equal(user.email, email);
            done();
          })
          .catch(done);
      });
    });
  });
});
