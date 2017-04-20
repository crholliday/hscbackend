'use strict'

/**
 * Module Dependencies
 */
const _ = require('lodash'),
    errors = require('restify-errors')

/**
 * Model Schema
 */
const TravelRoute = require('../models/travelRoute')

module.exports = function (server) {
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
     * LIST
     */
    server.get('/distinct_routes', function (req, res, next) {

        TravelRoute.aggregate(
            {$match: {isActive: true}},
            {$group: {
                    _id: {
                        departure: '$departureAirport',
                        arrival: '$arrivalAirport'
                    }
                }
            },
            {$project: {
                departureAirport: '$_id.departure',
                arrivalAirport: '$_id.arrival',
                '_id': 0
            }},
            function(err, travelRoutes){
                if (err) {
                    log.error(err)
                    return next(new errors.InvalidContentError(err.errors.name.message))
                }
                res.send(travelRoutes)
                next()
            })
    })

    /**
     * GET
     */
    server.get('/travel-route/:route_id', function (req, res, next) {

        TravelRoute.findOne({_id: req.params.route_id}, function (err, doc) {

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
    server.put('/travel-route/:route_id', function (req, res, next) {

        let data = req.body || {}

        if (!data._id) {
            _.extend(data, {
                _id: req.params.route_id
            })
        }

        TravelRoute.findOne({_id: req.params.route_id}, function (err, doc) {

            if (err) {
                log.error(err)
                return next(new errors.InvalidContentError(err.errors.name.message))
            } else if (!doc) {
                return next(new errors.ResourceNotFoundError('The resource you requested could not be found.'))
            }

            TravelRoute.update({_id: data._id}, data, function (err) {


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
    server.del('/travel-route/:route_id', function (req, res, next) {

        TravelRoute.remove({_id: req.params.route_id}, function (err) {

            if (err) {
                log.error(err)
                return next(new errors.InvalidContentError(err.errors.name.message))
            }

            res.send(204)
            next()

        })

    })

}
