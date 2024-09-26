import express from "express"

import type { Prisma } from "@prisma/client"
import PrismaClientPkg from "@prisma/client"

const PrismaClient = PrismaClientPkg.PrismaClient

const prisma = new PrismaClient()
const app    = express()
const port   = 3000

async function main() {
  app.get("/", (req, res) => {
    res.send("Hello!")
  })

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
