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
const Flights = require('../models/flight')
let flights = require('../modules/flights')

module.exports = function (server) {
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
    server.get('/cheap-flights-by-day', function (req, res, next) {

        Flights.aggregate(
            {$lookup: {
                from: 'travelroutes',
                localField: 'route',
                foreignField: '_id',
                as: 'routes'
            }},
            {$group: {
                    _id: {
                        departureAirport: '$routes.departureAirport',
                        arrivalAirport: '$routes.arrivalAirport',
                        year: {$year: '$created'},
                        month: {$month: '$created'},
                        day: {$dayOfMonth: '$created'}
                    },
                    total_price: {$min: '$fare.total_price'},
                    created: {$first: '$created'}
                }
            },
            {$project: {
                departureAirport: {$arrayElemAt: ['$_id.departureAirport', 0]},
                arrivalAirport: {$arrayElemAt: ['$_id.arrivalAirport', 0]},
                created : '$created',
                price: '$total_price',
                '_id': 0
            }},
            {$sort: {
                'created': 1,
                'departureAirport': 1,
                'arrivalAirport': 1
            }
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

}
