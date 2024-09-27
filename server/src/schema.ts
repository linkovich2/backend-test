import { Context } from './context'
import { makeExecutableSchema } from '@graphql-tools/schema'

export const typeDefs = `
  type Location {
    id: ID!
    name: String!
    tasks(complete: Boolean): [Task]
    total_cost(worker_ids: [Int!], complete: Boolean): Float
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
    logged_times(worker_ids: [Int!]): [LoggedTime]
  }

  type Worker {
    id: ID!
    username: String!
    hourly_wage: Float
    logged_times(location_ids: [Int!], complete: Boolean): [LoggedTime]
    total_cost(location_ids: [Int!], complete: Boolean): Float
  }

  type Query {
    locations(ids: [Int!], worker_ids: [Int!], complete: Boolean): [Location]!
    workers(ids: [Int!], location_ids: [Int!], complete: Boolean): [Worker]!
  }
`

export const resolvers = {
  Query: {
    locations: async (_parent, args: { ids?: [number], worker_ids?: [number], complete?: boolean }, context: Context) => {
      // eager load for performant queries
      // the AND empty objects are there because TS is lame sometimes
      return context.prisma.locations.findMany({ 
        where: { 
          AND: [
            { id: { in: args.ids } },
            { tasks: { some: { complete: args.complete } } },
            {
              tasks: {
                some: {
                  logged_times: {
                    some: { worker: { id: { in: args.worker_ids } }}
                  }
                }
              }
            }
          ] 
        }, 
        include: { 
          tasks: {
            include: {
              logged_times: {
                where: {},
                include: {
                  worker: true
                }
              }
            }
          }
        } 
      }) 
    },

    workers: async (_parent, args: { ids?: [number], location_ids?: [number], complete?: boolean }, context: Context) => { 
      return context.prisma.workers.findMany({ 
        where: {
          AND: [
            { id: { in: args.ids } },
            {
              logged_times: {
                some: {
                  task: {
                    complete: args.complete,
                    location: {
                      id: { in: args.location_ids }
                    }
                  }
                }
              }
            }
          ]
        }, 
        include: { 
          logged_times: { 
            include: {
              task: {
                include: {
                  location: true
                }
              }
            }
          } 
        }
      }) 
    },
  },
  Location: {
    tasks: async (parent, args, context: Context) => {
      return context.prisma.locations.findUnique({ where: { id: parent?.id } }).tasks({
        where: { complete: args.complete }
      })
    },
    total_cost: async (parent, args, context: Context) => {
      // see comment below at similar method
      const tasks = await context.prisma.locations.findUnique({
        where: { id: parent.id },
        include: {
          tasks: {
            include: {
              logged_times: {
                include: { worker: true }
              }
            }
          }
        }
      })

      const total = tasks?.tasks.reduce((sum, task) => {
        if (args.complete !== undefined && task.complete !== args.complete) {
          return sum
        }

        return sum + task.logged_times.reduce((task_sum, lt) => {
          if (args.worker_ids && !args.worker_ids.includes(lt.worker.id)) {
            return task_sum // Skip if worker ID is not in the filter
          }
          return task_sum + (lt.time_seconds / 3600) * lt.worker.hourly_wage.toNumber()
        }, 0)
      }, 0)

      console.log(total)

      return total
    }
  },
  LoggedTime: {
    task: async (parent, _args, context: Context) => {
      return context.prisma.logged_time.findUnique({ where: { id: parent?.id } }).task()
    },
    worker: async (parent, _args, context: Context) => {
      return context.prisma.logged_time.findUnique({ where: { id: parent?.id } }).worker()
    }
  },
  Task: {
    location: async (parent, _args, context: Context) => {
      return context.prisma.tasks.findUnique({ where: { id: parent?.id } }).location()
    },
    logged_times: async (parent, args, context: Context, info) => {
      return context.prisma.tasks.findUnique({ where: { id: parent?.id } }).logged_times({
        where: {
          worker: { id: { in: args.worker_ids } }
        }
      })
    }
  },
  Worker: {
    logged_times: async (parent, args, context: Context) => {
      return context.prisma.workers.findUnique({ where: { id: parent?.id } }).logged_times({
        where: {
          AND: [
            {
              task: {
                location: { id: { in: args.location_ids } }
              }
            },
            {
              task: { complete: args.complete }
            }
          ]
        }
      })
    },
    total_cost: async (parent, args, context: Context) => {
      // tried prisma's model extending but they don't allow relations there, plus there was no way to filter in the context of GraphQL at that point
      // tried adding together some computed fields in GraphQL but that was a bit weird and had the same problems as above
      // So ultimately we wind up with this, a little janky and likely not performant at larger datasets
      const logged_times = await context.prisma.workers.findUnique({
        where: { id: parent.id },
        include: { logged_times: { include: { task: true } } }
      })

      const filtered = logged_times?.logged_times.filter(t => {
        const task = t.task
        return (
          (args.location_ids ? args.location_ids.includes(task.location_id) : true) &&
          (args.complete !== undefined ? task.complete === args.complete : true)
        )
      })

      const total = filtered?.reduce((sum, t) => {
        return sum + (t.time_seconds / 3600) * parent.hourly_wage;
      }, 0)

      return total
    }
  }
}

export const schema = makeExecutableSchema({
  resolvers,
  typeDefs
})