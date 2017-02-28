const mongoose = require('mongoose')
const config = require('./config')

mongoose.connect(config.dbPath)
const db = mongoose.connection

db.on('error', function () {
	log.error('An error occured from the database... ')
})

db.once('open', function dbOpen() {
	log.info('Successfully opened the db... ')
})

exports.mongoose = mongoose
