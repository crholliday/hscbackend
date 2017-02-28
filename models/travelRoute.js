'use strict'

const mongoose = require('mongoose'),
      mongooseApiQuery = require('mongoose-api-query'),
      createdModified = require('mongoose-createdmodified')
        .createdModifiedPlugin

const TravelRouteSchema = new mongoose.Schema({
    departureAirport: {
        type: String,
        required: true,
        trim: true,
    },
    arrivalAirport: {
        type: String,
        required: true,
        trim: true,
    },
    durationDays: {
        type: Number
    },
    fromNow: {
        type: Number
    },
    isActive: {
        type: Boolean
    },
    class: {
        type: String,
        enum: ['economy', 'business', 'first', 'any']
    }
}, {minimize: false})


TravelRouteSchema.plugin(mongooseApiQuery)
TravelRouteSchema.plugin(createdModified, {index: true})

const TravelRoute = mongoose.model('TravelRoute', TravelRouteSchema)
module.exports = TravelRoute
