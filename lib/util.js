const path = require('path');
const fs = require('fs-extra');
const Git = require('./git.js');

/**
 * Sort function for paths.  Sorter paths come first.  Paths of equal length are
 * sorted alphanumerically in path segment order.
 * @param {string} a First path.
 * @param {string} b Second path.
 * @return {number} Comparison.
 */
function byShortPath(a, b) {
  const aParts = a.split(path.sep);
  const bParts = b.split(path.sep);
  const aLength = aParts.length;
  const bLength = bParts.length;
  let cmp = 0;
  if (aLength < bLength) {
    cmp = -1;
  } else if (aLength > bLength) {
    cmp = 1;
  } else {
    let aPart, bPart;
    for (let i = 0; i < aLength; ++i) {
      aPart = aParts[i];
      bPart = bParts[i];
      if (aPart < bPart) {
        cmp = -1;
        break;
      } else if (aPart > bPart) {
        cmp = 1;
        break;
      }
    }
  }
  return cmp;
}
exports.byShortPath = byShortPath;

/**
 * Copy a list of files.
 * @param {Array<string>} files Files to copy.
 * @param {string} base Base directory.
 * @param {string} dest Destination directory.
 * @return {Promise} A promise.
 */
exports.copy = async function (files, base, dest) {
  for (const file of files) {
    const src = path.resolve(base, file);
    const relative = path.relative(base, src);
    const target = path.join(dest, relative);
    await fs.ensureDir(path.dirname(target));
    await fs.copy(src, target);
  }
};

exports.getUser = async function (cwd) {
  try {
    const results = await Promise.all([
      new Git(cwd).exec('config', 'user.name'),
      new Git(cwd).exec('config', 'user.email'),
    ]);
    return {name: results[0].output.trim(), email: results[1].output.trim()};
  } catch {
    return null;
  }
};
