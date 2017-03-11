'use strict'

let axios = require('axios')
let flat = require('flat')
let config = require('../config')
let _ = require('lodash')
let moment = require('moment')

let Flight = require('../models/flight')
let TravelRoutes = require('../models/travelRoute')

const apiKey = config.flight_search.api_key
const baseURL = config.flight_search.base_url

module.exports = {

  loadFlights: function () {

    TravelRoutes.find({isActive: true}, function (err, routes) {
      log.info('Picked up ' + routes.length + ' Travel Routes...')

      routes.forEach(function (route) {

        let departureDate = moment().add(route.fromNow, 'd').format('YYYY-MM-DD')
        let returnDate = moment(departureDate).add(route.durationDays, 'd').format('YYYY-MM-DD')

        let params = {
          route: route._id,
          origin: route.departureAirport,
          destination: route.arrivalAirport,
          departure_date: departureDate,
          return_date: returnDate,
          apikey: apiKey,
          number_of_results: 5
        }

        let reqConfig = {
          url: baseURL,
          params: params,
        }

        let flight = {}

        axios.request(reqConfig)
          .then(function (response) {
            // console.log(flat(response.data))
            log.info('Data recieved from service...')
            loadRoutes(response.data)
          })
          .catch(function (error) {
            log.error(error)
          })

        function loadRoutes(data) {
          let flights = data.results
          for (let i in flights) {
            log.info('Iterating through results...')

            flight = _.merge(flights[i], params)

            let newFlight = new Flight(flight)
            
            newFlight.save(function (err) {
              if (err) {
                log.error(err)
              }
              log.info('Flight data saved')
            })
          }
        }
      })
    })
  }
}
