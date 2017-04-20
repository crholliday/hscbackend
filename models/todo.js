'use strict'

const mongoose = require('mongoose'),
      mongooseApiQuery = require('mongoose-api-query'),
      createdModified = require('mongoose-createdmodified')
        .createdModifiedPlugin

const TodoSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    importance: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Must be between 1 - 10']
    },
    dueDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'started', 'complete', 'overdue']
    },
}, {minimize: false})


TodoSchema.plugin(mongooseApiQuery)
TodoSchema.plugin(createdModified, {index: true})

const Todo = mongoose.model('Todo', TodoSchema)
module.exports = Todo
