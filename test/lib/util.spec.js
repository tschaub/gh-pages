const path = require('path');

const assert = require('../helper').assert;

const util = require('../../lib/util');

describe('util', function() {
  let files;
  beforeEach(function() {
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

  describe('byShortPath', function() {
    it('sorts an array of filepaths, shortest first', function() {
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

  describe('uniqueDirs', function() {
    it('gets a list of unique directory paths', function() {
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

    it('gets a list of unique directories on absolute paths', function() {
      const absoluteFiles = files.map(function(path) {
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

  describe('dirsToCreate', function() {
    it('gets a sorted list of directories to create', function() {
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
});
