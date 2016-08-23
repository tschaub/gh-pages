import path from 'path';
import rimraf from 'rimraf';
import glob from 'glob';

import {
  Repository,
  Remote,
  Cred,
} from 'nodegit';

export const createRepository = (workDir) =>
  Repository.init(workDir, 0);

export const setRemoteForPush = (repository, remote, url) =>
  Remote.create(repository, remote, url);

export const cleanup = (workDir) =>
  rimraf.sync(`${workDir}/.git`);

export const getRelativePath = (workDir, fileName) =>
  path.relative(workDir, fileName);

export const commitAllFiles = (repository, files = []) =>
  repository.refreshIndex()
    .then((index) => Promise.all(
      files.map(
        (fileName) =>
          index.addByPath(getRelativePath(repository.workdir(), fileName))
      ))
      .then(() => index.write())
      .then(() => index.writeTree())
    )
    .then((oid) => {
      const signature = repository.defaultSignature();
      return repository.createCommit('HEAD', signature, signature, 'gh-pages', oid, []);
    });

export const pushToGithub = (remote, branch) => {
  const options = {
    callbacks: {
      credentials: (url, userName) => Cred.sshKeyFromAgent(userName),
    },
  };

  return remote.push(`:refs/heads/${branch}`, options)
    .then(() => remote.push(`refs/heads/master:refs/heads/${branch}`, options));
};

export const getOriginRemoteUrl = (remoteName) =>
  Repository.open(process.cwd())
    .then((repository) => repository.getRemote(remoteName))
    .then((remote) => remote.url());

export const publish = (options = {}) => {
  const workDir = path.resolve(process.cwd(), options.src || '.');
  const remoteName = options.remoteName || 'origin';

  cleanup(workDir);

  const files = glob.sync(`${workDir}/**/*.*`, { dot: true });

  return createRepository(workDir)
    .then((repository) =>
      commitAllFiles(repository, files)
        .then(() => getOriginRemoteUrl(remoteName))
        .then((remoteUrl) => setRemoteForPush(repository, remoteName, remoteUrl))
        .then((remote) => pushToGithub(remote, options.branch || 'gh-pages')));
};
