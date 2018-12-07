'use strict'

const co = require('co');
const fs = require('fs');
const ftpd = require('../index.js');

const ftpOptions = {
    host: 'localhost',
    port: 1337,
    root: './ci/data',
    maxConnections: 2,
    startingPort: 20000,
};

const sleep = ms => new Promise( done => setTimeout(done, ms));

/**
 *
 *      ##### ###### #####
 *      ##      ##   ##  ##
 *      ####    ##   #####
 *      ##      ##   ##
 *      ##      ##   ##
 *
 */
const ftpServer = ftpd(ftpOptions, (session) => {

  session.on('pass', (username, password, cb) => {
      cb(null, 'Welcome');
  });

  session.on('stat', (pathName, cb) => {
    fs.stat(pathName, cb);
  });

  session.on('readdir', (pathName, cb) => {
    co(function*() {
        yield sleep(1000);
        fs.readdir(pathName, cb);
    });
  });

  session.on('read', (pathName, offset, cb) => {
    co(function*() {
        yield sleep(1000);
        cb(null, fs.createReadStream(pathName, { start: offset }));
    });
  });

  session.on('write', (pathName, offset, cb) => {cb(new Error("Forbidden"))});
  session.on('mkdir', (pathName, cb) => {cb(new Error("Forbidden"))});
  session.on('unlink', (pathName, cb) => {cb(new Error("Forbidden"))});
  session.on('rename', (fromName, toName, cb) => {cb(new Error("Forbidden"))});
  session.on('remove', (pathName, cb) => {cb(new Error("Forbidden"))});

});
