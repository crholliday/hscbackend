'use strict'

/**
 * Module Dependencies
 */
const _ = require('lodash'),
    errors = require('restify-errors')

/**
 * Model Schema
 */
const Crypto = require('../models/crypto')

module.exports = function (server) {
    /**
     * List Crypto
     */
    server.get('/cryptos', function (req, res, next) {
        Crypto.find({}, function (err, docs) {
            if (err) {
                log.error(err)
                return next(new errors.InvalidContentError(err.errors.name.message))
            }
            res.send(docs)
            next()
        })
    })

    /**
     * POST Crypto
     */
    server.post('/crypto', function (req, res, next) {

        let data = req.body || {}

        let crypto = new Crypto(data)
        crypto.save(function (err) {

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
     * UPDATE
     */
    server.put('/crypto/:crypto_id', function (req, res, next) {

        let data = req.body || {}

        if (!data._id) {
            _.extend(data, {
                _id: req.params.crypto_id
            })
        }

        Crypto.findOne({_id: req.params.crypto_id}, function (err, doc) {

            if (err) {
                log.error(err)
                return next(new errors.InvalidContentError(err.errors.name.message))
            } else if (!doc) {
                return next(new errors.ResourceNotFoundError('The resource you requested could not be found.'))
            }

            Crypto.update({_id: data._id}, data, function (err) {


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
     * LIST
     */
    server.get('/crypto-totals', function (req, res, next) {
       Crypto.aggregate(
            {$group: {
                    _id: '$currency',
                    totalCrypto: {$sum: '$amount'},
                    totalFee: {$sum: '$fee'},
                    totalCost: {$sum: '$cost'}
                }
            },
            {$project: {
                '_id': 0,
                'currency': '$_id',
                'totalCrypto': '$totalCrypto',
                'totalFee': '$totalFee',
                'totalCost': '$totalCost'
            }},
            function(err, crytpoTotals){
                if (err) {
                    log.error(err)
                    return next(new errors.InvalidContentError(err.errors.name.message))
                }
                res.send(crytpoTotals)
                next()
            })
    })

    /**
     * DELETE
     */
    server.del('/crypto/:crypto_id', function (req, res, next) {

        Crypto.remove({_id: req.params.crypto_id}, function (err) {

            if (err) {
                log.error(err)
                return next(new errors.InvalidContentError(err.errors.name.message))
            }

            res.send(204)
            next()

        })

    })

}
