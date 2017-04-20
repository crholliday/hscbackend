'use strict'

/**
 * Module Dependencies
 */
const _           = require('lodash'),
    errors        = require('restify-errors'),
	passport      = require('passport-restify'),
	LocalStrategy = require('passport-local').Strategy,
	JwtStrategy   = require('passport-jwt').Strategy,
    ExtractJwt    = require('passport-jwt').ExtractJwt,
    jwt           = require('jwt-simple'),
	config 		  = require('../config.js')

/**
 * Model Schema
 */
const User = require('../models/user')

module.exports = function (server) {

    /**
     * Register User
     */
    server.post('/register', function (req, res, next) {
        let data = req.body || {}
        let user = new User(data)
        user.save(function (err) {
            if (err) {
                log.error(err)
                return next(new errors.InternalError(err.message))
                next()
            }
			let token = jwt.encode({username: user.password}, config.TOKEN_SECRET)
			res.json({token : token})
            next()
        })
    })

    /**
     * Login and get a JWT token back in the response
     */
    server.post('/login', passport.authenticate('local'), function(req, res) {
		//user has authenticated correctly thus we create a JWT token
		let token = jwt.encode({user: req.user}, config.TOKEN_SECRET)
		res.json({token : token})
	})

	/**
     * Login and get a JWT token back in the response
     */
    server.post('/testSecure', passport.authenticate('local'), function(req, res) {
		//user has authenticated correctly thus we create a JWT token
		let token = jwt.encode({user: req.user}, config.TOKEN_SECRET)
		res.json({token : token})
	})

    /**
     * Passport localStrategy middleware stuff
     */
    passport.use(new LocalStrategy(
        function (username, password, done) {
            User.findOne({username: username}, function (err, user) {
                if (err) {
                    throw err
				}
                if (!user) {
                    return done(null, false, {message: 'Unknown User'})
				}
                user.comparePassword(password, function (err, isMatch) {
                    if (err) {
                        throw err
					}
                    if (isMatch) {
                        return done(null, user)
                    } else {
                        return done(null, false, {message: 'Invalid password'})
                    }
                })
            })
        }))

	passport.serializeUser(function(user, done) {
		done(null, user.id)
		})

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user)
			})
		})

}
