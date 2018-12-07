'use strict'

const { createServer } = require('net')

const FTPSession = require('./lib/session')

const availablePorts = [];
let sessions = []; // Array of {socket, port}

function cleanUnusedPorts() {
  sessions = sessions.filter(session => {
    if (session.socket.destroyed) {
      availablePorts.push(session.port);
      console.log('free port', session.socket.localPort, session.socket.remotePort);
      return false;
    }
    return true;
  });
}

function getFreePort (socket) {
  cleanUnusedPorts();
  const port = availablePorts.pop();
  sessions.push({ socket, port });
  return port;
}

function ftpd (opts, sessionCb) {
  if (typeof opts === 'string') {
    const [ host, port ] = opts.split(':')
    opts = { host: host, port: parseInt(port, 10) }
  }

  opts = Object.assign({
    host: '127.0.0.1',
    port: 1337,
    root: '/',
    maxConnections: 10,
    startingPort: 20000,
    readOnly: true
  }, opts)

  for (let portCount = 0; portCount < opts.maxConnections; portCount += 1){
    availablePorts.push(opts.startingPort + portCount);
  }

  const ftpServer = createServer()
  ftpServer.maxConnections = opts.maxConnections

  if (sessionCb) {
    ftpServer.on('connection', (socket) => {
      const session = new FTPSession(socket, {
        host: opts.host,
        root: opts.root,
        passivePort: getFreePort(socket),
        readOnly: opts.readOnly,
      })
      session.accept(opts.greet).then(() => {
        sessionCb(session)
      })
    })

    ftpServer.listen(opts.port, opts.host)
  }

  return ftpServer
}

module.exports = ftpd
