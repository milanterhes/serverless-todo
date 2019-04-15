'use strict';

if (!global._babelPolyfill) {
  require('@babel/polyfill')
}

const {ApolloServer, gql} = require('apollo-server-lambda')
const { GraphQLJSONObject } = require('graphql-type-json');
const db = require('./utils/db')

const typeDefs = gql`
  scalar JSONObject

  type Query {
    getTodolists: [TodoList]
  }
  type Mutation {
    addTodolist(name: String!): MutationMessage
    addTodo(text: String!, listId: String!): MutationMessage
    editTodo(id: String!, text: String, completed: Boolean): MutationMessage
    deleteTodolist(id: String!): MutationMessage
  }
  type Todo {
    id: ID,
    text: String,
    completed: Boolean,
    createdAt: String
  }
  type TodoList {
    id: ID,
    name: String,
    todos: [Todo]
  }
  type MutationMessage {
    success: Boolean,
    error: String,
    data: JSONObject
  }
`;

const resolvers = {
  Query: {
    getTodolists: () => db.todoList.find()
  },

  Mutation: {
    addTodolist: async (obj, {name}) => {
      const newList = new db.todoList({name})
      let error;
      await newList.save(function (err) {
        error = err
      });
      return (
        !error ? {
          success: true,
          data: {...await db.todoList.find(), newList}
        } :
        {
          success: false,
          error
        }
      )
    },

    deleteTodolist: async (obj, {id}) => {
      let error;
      await db.todoList.findByIdAndDelete(id).exec((error, res) => {
        error = error
      })
      return (
        !error ? 
        {
          success: true,
          data: await db.todoList.find()
        } :
        {
          success: false,
          error
        }
      )
    },

    addTodo: async (obj, {text, listId}) => {
      const list = await db.todoList.findById(listId)
      const todo = await list.todos.push({text, completed: false})
      let error;
      await list.save((err) => {
        error = err
      })
      return (
        error ? 
        {
          success: false,
          error
        }: 
        {
          success: true,
          data: list
        }
      )
    },

    editTodo: async (obj, {id, text, completed}) => {
      let foundId = false
      let error
      let list = await db.todoList.findOne({"todos._id": id}).then(function(todoList) {
        for(let todo of todoList.todos){
          if(todo.id == id){
            if(text !== undefined) {
              todo.text = text
            }
            if(completed !== undefined) {
              todo.completed = completed
            }
            foundId = true
            break
          }
        }
        todoList.save(err => error = err)
      })
      return (
        foundId && !error ? 
        {
          success: true,
          data: list
        } :
        {
          success: false,
          error
        }
      )
    },

  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: {
    settings: {
      "request.credentials": "same-origin"
    }
  }
})

module.exports.graphql = server.createHandler()
