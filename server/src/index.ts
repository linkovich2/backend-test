import { create_server, default_port, ctx as context } from './server.js'

async function main() {
  const server = create_server(default_port)
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
