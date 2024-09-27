import express from "express"
import helmet from "helmet"
import { graphqlHTTP } from 'express-graphql'
import { schema } from './schema.js'
import { context } from './context.js'

const app  = express()
const port = 3000

// @todo tests

async function main() {
  app.use(helmet())

  app.use('/', graphqlHTTP({ schema, context }))

  app.listen(port, "0.0.0.0", () => {
    console.info(`App listening on ${port}.`)
  })
}

main()
  .then(async () => {
    await context.prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await context.prisma.$disconnect()
    process.exit(1)
  })
