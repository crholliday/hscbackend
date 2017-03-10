'use strict'

/**
 * Module Dependencies
 */
const _ = require('lodash'),
    errors = require('restify-errors'),
    mongoose = require('mongoose')

/**
 * Model Schema
 */
const Todo = require('../models/todo')
const TravelRoute = require('../models/travelRoute')
const Flights = require('../models/flight')
const Airlines = require('../models/airlines')
let flights = require('../modules/flights')


/**
 * GET covers the root
 */
server.get('/', function (req, res, next) {

    const msg = 'You are probably in the wrong place. This is an API endpoint only location... '
    res.send(msg)
    next()

})

/**
 * POST Todo
 */
server.post('/todos', function (req, res, next) {

    let data = req.body || {}

    let todo = new Todo(data)
    todo.save(function (err) {

        if (err) {
            log.error(err)
            return next(new errors.InternalError(err.message))
            next()
        }

        res.send(201)
        next()
    })
})

/**
 * List Travel Routes
 */
server.get('/travel-routes', function (req, res, next) {
    TravelRoute.apiQuery(req.params, function (err, docs) {
        if (err) {
            log.error(err)
            return next(new errors.InvalidContentError(err.errors.name.message))
        }
        res.send(docs)
        next()
    })
})

/**
 * POST Travel Route
 */
server.post('/travel-route', function (req, res, next) {

    let data = req.body || {}

    let travelRoute = new TravelRoute(data)
    travelRoute.save(function (err) {

        if (err) {
            log.error(err)
            return next(new errors.InternalError(err.message))
            next()
        }

        res.send(201)
        next()
    })
})

/**
 * POST Flight Route
 */
server.post('/flight', function (req, res, next) {

    flights.loadFlights()
    res.send('Flights loaded...', 201)
    next()
})


/**
 * LIST
 */
server.get('/todos', function (req, res, next) {
    Todo.apiQuery(req.params, function (err, docs) {
        if (err) {
            log.error(err)
            return next(new errors.InvalidContentError(err.errors.name.message))
        }
        res.send(docs)
        next()
    })
})

/**
 * List all airlines
 */
server.get('/airlines', function (req, res, next) {
    Airlines.find({}, function (err, docs) {
        if (err) {
            log.error(err)
            return next(new errors.InvalidContentError(err.errors.name.message))
        }
        res.send(docs)
        next()
    })
})

/**
 * GET Airline by IATA
 */
server.get('/airlines/:iata', function (req, res, next) {

    Airlines.findOne({IATA: req.params.iata}, function (err, doc) {

        if (err) {
            log.error(err)
            return next(new errors.InvalidContentError(err.errors.name.message))
        }
        if (res && doc) {
            res.send(doc)
            next()
        } else {
            res.send('')
            next()
        }
    })

})

/**
 * LIST
 */
server.get('/cheap-flights', function (req, res, next) {

    Flights.aggregate(
        {$sort: {'fare.total_price': 1}},
        {$group: {
                _id: {
                    route: '$route'
                },
                total_price: {$min: '$fare.total_price'},
                doc: {$first: '$$ROOT'}
            }
        },
        {$lookup: {
            from: 'travelroutes',
            localField: '_id.route',
            foreignField: '_id',
            as: 'routes'
        }},
        {$unwind: '$routes'},
        {$unwind: '$doc.itineraries'},
        {$project: {
            departureAirport: '$routes.departureAirport',
            arrivalAirport: '$routes.arrivalAirport',
            departureDate: '$doc.departure_date',
            returnDate: '$doc.return_date',
            'price': '$total_price',
            'routeID': '$_id.route',
            'docFlightID': '$doc._id',
            'docCreated': '$doc.created',
            'departureFirstFlight': {$arrayElemAt: ['$doc.itineraries.outbound.flights', 0]},
            'departureLastFlight': {$arrayElemAt: ['$doc.itineraries.outbound.flights', -1]},
            'returnFirstFlight': {$arrayElemAt: ['$doc.itineraries.inbound.flights', 0]},
            'returnLastFlight': {$arrayElemAt: ['$doc.itineraries.inbound.flights', -1]},
            'doc': 1,
            '_id': 0
        }},
        {$sort: {
            'departureAirport': 1,
            'arrivalAirport': 1,
            'cheap_price': 1,
            'departureDate': -1}
        },
        function(err, cheapFlights){
            if (err) {
                log.error(err)
                return next(new errors.InvalidContentError(err.errors.name.message))
            }
            res.send(cheapFlights)
            next()
        })
})


/**
 * GET
 */
server.get('/todos/:todo_id', function (req, res, next) {

    Todo.findOne({_id: req.params.todo_id}, function (err, doc) {

        if (err) {
            log.error(err)
            return next(new errors.InvalidContentError(err.errors.name.message))
        }

        res.send(doc)
        next()

    })

})


/**
 * UPDATE
 */
server.put('/todos/:todo_id', function (req, res, next) {

    let data = req.body || {}

    if (!data._id) {
        _.extend(data, {
            _id: req.params.todo_id
        })
    }

    Todo.findOne({_id: req.params.todo_id}, function (err, doc) {

        if (err) {
            log.error(err)
            return next(new errors.InvalidContentError(err.errors.name.message))
        } else if (!doc) {
            return next(new errors.ResourceNotFoundError('The resource you requested could not be found.'))
        }

        Todo.update({_id: data._id}, data, function (err) {


            if (err) {
                log.error(err)
                return next(new errors.InvalidContentError(err.errors.name.message))
            }


            res.send(200, data)
            next()

        })

    })

})

/**
 * DELETE
 */
server.del('/todos/:todo_id', function (req, res, next) {

    Todo.remove({_id: req.params.todo_id}, function (err) {

        if (err) {
            log.error(err)
            return next(new errors.InvalidContentError(err.errors.name.message))
        }

        res.send(204)
        next()

    })

})
