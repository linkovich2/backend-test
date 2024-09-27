import { PrismaClient } from '@prisma/client'
import { makeExecutableSchema } from '@graphql-tools/schema'

export const prisma = new PrismaClient()

export const typeDefs = `
  type Location {
    id: ID!
    name: String!
    tasks: [Task]
    # @todo computed sum of how much money is spent on this location
    # tasks.logged_times.collect {|t| t.seconds/3600 * t.worker.hourly_wage}
  }

  type LoggedTime {
    id: ID!
    time_seconds: Int!
    task: Task!
    worker: Worker!
  }

  type Task {
    id: ID!
    complete: Boolean!
    description: String
    location: Location!
    logged_times: [LoggedTime]
  }

  type Worker {
    id: ID!
    username: String!
    hourly_wage: Float
    logged_times: [LoggedTime]
    # @todo computed sum of how much money is spent on this worker across all tasks
    # (logged_time.sum seconds / 3600) * hourly_wage
  }

  type Query {
    locations(ids: [Int!], worker_ids: [Int!] complete: Boolean): [Location]!
    workers(id: [Int!], location_ids: [Int!], complete: Boolean): [Worker]!
  }
`

export const resolvers = {
  Query: {
    locations: (_parent, args: { ids?: [number], worker_ids?: [number], complete?: boolean }) => {
      let q = { 
        where: {}, 
        include: { 
          tasks: { 
            where: { AND: [{}] }
          } 
        } 
      }

      if (args.ids) {
        q.where = { id: { in: args.ids } }
      }

      if (args.worker_ids) {
        q.include.tasks.where.AND.push({ id: { in: args.worker_ids } })
      }

      if (args.complete) {
        q.include.tasks.where.AND.push({ complete: args.complete })
      }

      return prisma.locations.findMany(q) 
    },

    workers: (_parent, args: { ids?: [number], location_ids?: [number], complete?: boolean }) => { 
      let q = { 
        where: {}, 
        include: { 
          logged_times: { 
            where: { AND: [{}] } 
          } 
        } 
      }

      if (args.ids) {
        q.where = { id: { in: args.ids } }
      }

      if (args.location_ids) {
        q.include.logged_times.where.AND.push({ 
          task: { 
            location: { 
              id: { in: args.location_ids } 
            } 
          } 
        })
      }

      if (args.complete) {
        q.include.logged_times.where.AND.push({ task: { complete: args.complete } })
      }

      return prisma.workers.findMany(q) 
    },
  },
  Location: {
    tasks: (parent, _args) => {
      return prisma.locations.findUnique({ where: { id: parent?.id } }).tasks()
    }
  },
  LoggedTime: {
    task: (parent, _args) => {
      return prisma.logged_time.findUnique({ where: { id: parent?.id } }).task()
    },
    worker: (parent, _args) => {
      return prisma.logged_time.findUnique({ where: { id: parent?.id } }).worker()
    }
  },
  Task: {
    location: (parent, _args) => {
      return prisma.tasks.findUnique({ where: { id: parent?.id } }).location()
    },
    logged_times: (parent, _args) => {
      return prisma.tasks.findUnique({ where: { id: parent?.id } }).logged_times()
    }
  },
  Worker: {
    logged_times: (parent, _args) => {
      return prisma.workers.findUnique({ where: { id: parent?.id } }).logged_times()
    }
  }
}

export const schema = makeExecutableSchema({
  resolvers,
  typeDefs
})