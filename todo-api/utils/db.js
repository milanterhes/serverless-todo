if (!global._babelPolyfill) {
    require('@babel/polyfill')
}

const mongoose = require('mongoose')

mongoose.connect(process.env.DB, {useNewUrlParser: true})

const connection = mongoose.connection;

const todoSchema = new mongoose.Schema({
    text: String,
    completed: Boolean,
    createdAt: {type: Date, default: Date.now}
})

const todoListSchema = new mongoose.Schema({
    name: String,
    todos: [todoSchema]
})

const todoList = mongoose.model('todoList', todoListSchema)
const todo = mongoose.model('todo', todoSchema)

module.exports = {
    todoList,
    todo
}