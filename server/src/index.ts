import express from "express"
import { graphqlHTTP } from 'express-graphql'
import { schema, prisma } from './schema.js'

const app  = express()
const port = 3000

async function main() {
  app.use('/', graphqlHTTP({ schema }))

  app.listen(port, "0.0.0.0", () => {
    console.info(`App listening on ${port}.`)
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
