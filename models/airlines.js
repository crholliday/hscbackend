'use strict'

const mongoose = require('mongoose'),
      mongooseApiQuery = require('mongoose-api-query'),
      createdModified = require('mongoose-createdmodified')
        .createdModifiedPlugin

const AirlineSchema = new mongoose.Schema({
    Airline: {
        type: String,
        required: true,
        trim: true,
    },
    IATA: {
        type: String,
        required: true,
        trim: true,
    },
    ICAO: {
        type: String,
        required: true,
        trim: true,
    },
    Country: {
        type: String,
        enum: ['pending', 'complete', 'overdue']
    },
}, {minimize: false})


AirlineSchema.plugin(mongooseApiQuery)

const Airline = mongoose.model('Airline', AirlineSchema)
module.exports = Airline
