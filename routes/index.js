'use strict'

/**
 * Module Dependencies
 */


/**
 * Bring in other routes
 */

require('../routes/travelroutes.js')(server)
require('../routes/airlines.js')(server)
require('../routes/flights')(server)
require('../routes/todos')(server)
require('../routes/users')(server)
require('../routes/crypto')(server)

/**
 * GET covers the root
 */
server.get('/', function (req, res, next) {
    const msg = 'You are probably in the wrong place. This is an API endpoint only location... '
    res.send(msg)
    next()
})
