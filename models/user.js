'use strict'

let bcrypt 			 = require('bcrypt-nodejs')
let mongoose 		 = require('mongoose')
let mongooseApiQuery = require('mongoose-api-query')
let createdModified  = require('mongoose-createdmodified').createdModifiedPlugin

let Schema 			 = mongoose.Schema


let schemaOptions = {
	timestamps: true,
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
}

/*let validateLocalStrategyProperty = function(property) {
	return (this.provider !== "local" && !this.updated) || property.length;
};

let validateLocalStrategyPassword = function(password) {
	return this.provider !== "local" || (password && password.length >= 6);
};*/

let UserSchema = new Schema({
	fullName: {
		type: String,
		trim: true,
		'default': '',
		required: [true, 'Please fill in your full name']
	},
	email: {
		type: String,
		trim: true,
		unique: true,
		index: true,
		lowercase: true,
		'default': '',
		required: [true, 'Please fill in a valid email address'],
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	username: {
		type: String,
		unique: true,
		index: true,
		lowercase: true,
		required: 'Please fill in a username',
		trim: true,
		match: [/^[\w][\w\-\._\@]*[\w]$/, 'Please fill a valid username']
	},
	password: {
		type: String,
		'default': '',
		required: [true, 'Password should be longer']
	}

}, schemaOptions)

UserSchema.plugin(mongooseApiQuery)
UserSchema.plugin(createdModified, {index: true})

/**
 * Password hashing
 */
UserSchema.pre('save', function(next) {
	let user = this
	if (!user.isModified('password'))		{
		return next()
}
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(user.password, salt, null, function(err, hash) {
			user.password = hash
			next()
		})
	})
})

/**
 * Password compare
 */
UserSchema.methods.comparePassword = function(password, cb) {
	bcrypt.compare(password, this.password, function(err, isMatch) {
		cb(err, isMatch)
	})
}

let User = mongoose.model('User', UserSchema)

module.exports = User
