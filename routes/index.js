'use strict'

/**
 * Module Dependencies
 */
const _ = require('lodash'),
    errors = require('restify-errors'),
    mongoose = require('mongoose')


/**
 * Bring in other routes
 */

require('../routes/travelroutes.js')(server)
require('../routes/airlines.js')(server)
require('../routes/flights')(server)
require('../routes/todos')(server)

/**
 * GET covers the root
 */
server.get('/', function (req, res, next) {
    const msg = 'You are probably in the wrong place. This is an API endpoint only location... '
    res.send(msg)
    next()
})
