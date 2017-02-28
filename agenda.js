'use strict'

let logger = require('./logger')
let config = require('./config')
let Agenda = require('agenda')
let flights = require('./modules/flights')
let chalk = require('chalk')

let agenda = new Agenda({
	db: {
		address: config.db.uri,
		collection: 'hscJobs'
	},
	processEvery: config.agendaTimer || '8 hours'
})

agenda.on('fail', function(err, job) {
	return logger.error('Job failed with error: ' + err.message)
})

/**
 * Load flights every ... hours
 */
agenda.define('loadFlights', function(job, done) {
	logger.debug("Running 'loadFlights' process...")
	try {

        flights.loadFlights()

	} catch (error) {
		logger.error('Job running exception!')
		logger.error(error)
		return done(error)
	}
})

/**
 * Starting agenda
 */
agenda.on('ready', function() {
    /*is this in test mode*/
	if (false) {
    return
}

	agenda.every('eight hours', 'loadFlights')
	agenda.start()
	logger.info(chalk.yellow('Agenda started!'))
})

module.exports = agenda
