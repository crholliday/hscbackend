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
 * LIST
 */
server.get('/cheap-flights', function (req, res, next) {

    Flights.aggregate(
        {$group: {
                _id: {
                    route: '$route',
                    departure_date: '$departure_date',
                    return_date: '$return_date'
                },
                total_price: {$min: '$fare.total_price'}
            }
        },
        {$lookup: {
            from: 'travelroutes',
            localField: '_id.route',
            foreignField: '_id',
            as: 'routes'
        }},
        {$unwind: '$routes'},
        {$project: {
            departureAirport: '$routes.departureAirport',
            arrivalAirport: '$routes.arrivalAirport',
            departureDate: '$_id.departure_date',
            returnDate: '$_id.return_date',
            'total_price': 1,
            'routeID': '$_id.route',
            '_id': 0
        }},
        {$sort: {'total_price': 1}},
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
