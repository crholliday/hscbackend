'use strict'

const mongoose = require('mongoose'),
      mongooseApiQuery = require('mongoose-api-query'),
      createdModified = require('mongoose-createdmodified')
        .createdModifiedPlugin

const CryptoSchema = new mongoose.Schema({
    currency: {
        type: String,
        required: true,
        enum: ['BTC', 'LTC', 'BCH', 'ETH', 'IOT']
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date
    },
    fee: {
        type: Number,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    txn: {
        type: String,
        required: true
    }
}, {minimize: false})


CryptoSchema.plugin(mongooseApiQuery)
CryptoSchema.plugin(createdModified, {index: true})

const Crypto = mongoose.model('Crypto', CryptoSchema)
module.exports = Crypto
