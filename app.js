'use strict'

/**
 * Module Dependencies
 */
const config        = require('./config'),
      restify       = require('restify'),
      winston       = require('winston'),
      bunyanWinston = require('bunyan-winston-adapter'),
      mongoose      = require('mongoose'),
      passport      = require('passport-restify'),
      agenda        = require('./agenda'),
      zmq           = require('zeromq'),
      corsMiddleware = require('restify-cors-middleware')

const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: ['http://www.hotsexcoffee.com',
              'http://hotsexcoffee.com',
              'http://www.hotsexcoffee.com:8080',
              'https://www.hotsexcoffee.com:443',
              'https://hotsexcoffee.com:443',
              'http://localhost:8080'],
    allowHeaders: ['API-Token', 'X-IOTA-API-Version'],
    exposeHeaders: ['API-Token-Expiry']
})

/**
 * Logging
 */
global.log = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: 'info',
            timestamp: () => {
                return new Date().toString()
            },
            json: true
        }),
    ]
})

/**
 * Initialize Server
 */
global.server = restify.createServer({
    name            : config.name,
    version         : config.version,
    log             : bunyanWinston.createAdapter(log),
    socketio        : true
})

/**
 * Middleware
 */
server.use(restify.plugins.jsonBodyParser({mapParams: true}))
server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser({mapParams: true}))
server.use(restify.plugins.fullResponse())
server.use(passport.initialize())
server.pre(cors.preflight)
server.use(cors.actual)

/**
 * Error Handling
 */
server.on('uncaughtException', (req, res, route, err) => {
    log.error(err.stack)
    res.send(err)
})

var io = require('socket.io').listen(server)

io.on('connection', function (skt) {
    log.info('Somebody connected to the socket...')
    skt.emit('info', {hello: 'world'})
    // subber.js
    var sock = zmq.socket('sub')

    sock.connect('tcp://' + config.zmq_url)
    sock.subscribe('')
    log.info('Subscriber connected to port 5556')

    sock.on('message', function(topic) {
        var tp = topic.toString()
        var arr = tp.split(' ')

        if (arr[0] === 'tx') {
            let msg = {
                hash: arr[1],
                'address': arr[2],
                'amount': arr[3],
                'tag': arr[4],
                'timestamp': arr[5],
                'currentIndex': arr[6],
                'lastIndex': arr[7],
                'bundle': arr[8],
                'trunk': arr[9],
                'branch': arr[10],
                'arrivalDate': arr[11]
            }
            skt.emit(arr[0], msg)
        } else {
            skt.emit(arr[0], arr)
        }

        // log.info(arr)
    })
  })

/**
 * Lift Server, Connect to DB & Bind Routes
 */
server.listen(config.port, function() {
    mongoose.connection.on('error', function(err) {
        log.error('Mongoose default connection error: ' + err)
        process.exit(1)
    })

    mongoose.connection.on('open', function(err) {
        if (err) {
            log.error('Mongoose default connection error: ' + err)
            process.exit(1)
        }

        log.info(
            '%s v%s ready to accept connections on port %s in %s environment.',
            server.name,
            config.version,
            config.port,
            config.env
        )

        require('./routes')

    })

    global.db = mongoose.connect(config.db.uri)

})
