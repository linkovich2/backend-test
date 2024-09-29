import express from "express"
import helmet from "helmet"
import { context } from '../src/context.js'
import { graphqlHTTP } from 'express-graphql'
import { schema } from './schema.js'

const app  = express()
export const default_port = 3000
export const ctx = context

export function create_server(port: number) {
  app.use(helmet())

  app.use('/', graphqlHTTP({ schema, context }))

  return app.listen(port, "0.0.0.0", () => {
    console.info(`App listening on ${port}.`)
  })
}