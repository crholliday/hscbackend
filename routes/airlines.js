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
const Airlines = require('../models/airlines')

module.exports = function (server) {
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

}
