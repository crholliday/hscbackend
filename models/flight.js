'use strict'

const mongoose = require('mongoose'),
    mongooseApiQuery = require('mongoose-api-query'),
    createdModified = require('mongoose-createdmodified').createdModifiedPlugin

const FlightSchema = new mongoose.Schema({
    route: {
        type: mongoose.Schema.Types.ObjectId, ref: 'TravelRoute'
    },
    departure_date: {
        type: Date
    },
    return_date: {
        type: Date
    },
    fare: {
        total_price: {
            type: Number
        }
    },
    itineraries: [{
        outbound: {
            flights: [{
                departs_at: {type: Date},
                arrives_at: {type: Date},
                origin: {
                    airport: {type: String}

                },
                destination: {
                    airport: {type: String}
                },
                marketing_airline: {type: String},
                operating_airline: {type: String},
                flight_number: {type: String},
                booking_info: {
                    travel_class: {type: String},
                    booking_code: {type: String},
                    seats_remaining: {type: Number}
                }
            }]
        },
        inbound: {
            flights: [{
                departs_at: {type: Date},
                arrives_at: {type: Date},
                origin: {
                    airport: {type: String}

                },
                destination: {
                    airport: {type: String}
                },
                marketing_airline: {type: String},
                operating_airline: {type: String},
                flight_number: {type: String},
                booking_info: {
                    travel_class: {type: String},
                    booking_code: {type: String},
                    seats_remaining: {type: Number}
                }
            }]
        }
    }]
}, {minimize: false})


FlightSchema.plugin(mongooseApiQuery)
FlightSchema.plugin(createdModified, {index: true})

const Flight = mongoose.model('Flight', FlightSchema)
module.exports = Flight
