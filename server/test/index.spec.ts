import { expect } from 'chai'
import { create_server, ctx as context } from '../src/server.js'

import request from 'supertest'
import gql from 'graphql-tag'
import { print } from 'graphql/language/printer.js'

const server = create_server(3001)

describe('GraphQL API', () => {
  before(async () => {
    const db_status_check = await context.prisma.locations.count() > 0
    if (!db_status_check) {
      throw Error("Database needs seeding. Run `docker-compose exec server npx prisma db seed`") 
      // @todo seeding should be automated in a proper CI environment, 
      // but locally since it takes a while I figure its fine for it to be manual
    }
  })

  after(() => {
    server.close()
  })

  it('should fetch locations based on filters', async () => {
    const db_location = await context.prisma.locations.findFirst()

    const query = gql`
      query Locations($ids: [Int!]) {
        locations(ids: $ids) { 
          id
          name 
        }
      }
    `

    const response = await request(server)
      .post('/')
      .send({
          query: print(query),
          variables: {
            ids: [db_location?.id]
          }
      })
      .set('Accept', 'application/json')
    
    const body = response.body

    expect(body).to.have.property('data')
    expect(body.data).to.have.property('locations').that.is.an('array')

    const location = body.data.locations[0]
    expect(location).to.have.property('id')
    expect(location.id).to.eq(db_location?.id.toString())
    expect(location).to.have.property('name')
    expect(location.name).to.eq(db_location?.name)
  })

  it('should fetch workers based on filters', async () => {
    const query = gql`
      query GetWorkers($ids: [Int!], $location_ids: [Int!], $complete: Boolean) {
        workers(ids: $ids, location_ids: $location_ids, complete: $complete) {
          id
          username
          hourly_wage
          logged_times {
            id
            time_seconds
            task {
              id
              complete
              location {
                id
                name
              }
            }
          }
        }
      }
    `

    const response = await request(server)
      .post('/')
      .send({
          query: print(query), 
          variables: {
            ids: [1],
            location_ids: [1],
            complete: false
          }
      })
      .set('Accept', 'application/json')
    
    const body = response.body

    expect(body).to.have.property('data')
    expect(body.data).to.have.property('workers').that.is.an('array')

    const worker = body.data.workers[0]

    expect(worker).to.have.property('id')
    expect(worker).to.have.property('username')
    expect(worker).to.have.property('hourly_wage')
    expect(worker).to.have.property('logged_times').that.is.an('array')
  })

  describe("#total_cost computed field", () => {
    describe("with no filter applied", () => {
      describe("on workers", () => {
        it("should show the aggregate total spent", async () => {
          const worker_count = await context.prisma.workers.count()

          const query = gql`
            query Workers {
              workers { 
                id
                hourly_wage 
                total_cost
              }
            }
          `

          const response = await request(server)
            .post('/')
            .send({ query: print(query) })
            .set('Accept', 'application/json')
          
          const body = response.body
          expect(body).to.have.property('data')
          expect(body.data).to.have.property('workers').that.is.an('array')
          expect(body.data.workers.length).to.eq(worker_count) // returned all
      
          const worker = body.data.workers[0]
          const db_worker = await context.prisma.workers.findUnique({ 
            where: { id: parseInt(worker.id) }, 
            include: { 
              logged_times: true 
            } 
          })
          let total_cost = 0.0

          db_worker?.logged_times.forEach((lt) => {
            total_cost += (lt.time_seconds / 3600) * db_worker?.hourly_wage.toNumber()
          })

          // JS is doing some weird stuff with the Decimal type here on occasion, so ceil is here as a @temp fix
          expect(Math.ceil(total_cost)).to.eq(Math.ceil(worker.total_cost))
        })
      })

      describe("on locations", () => {
        it("should show the aggregate total spent", async () => {
          const location_count = await context.prisma.locations.count()

          const query = gql`
            query Locations {
              locations { 
                id
                name 
                total_cost
              }
            }
          `

          const response = await request(server)
            .post('/')
            .send({ query: print(query) })
            .set('Accept', 'application/json')
          
          const body = response.body
          expect(body).to.have.property('data')
          expect(body.data).to.have.property('locations').that.is.an('array')
          expect(body.data.locations.length).to.eq(location_count) // returned all
      
          const location = body.data.locations[0]
          const db_location = await context.prisma.locations.findUnique({ 
            where: { id: parseInt(location.id) }, 
            include: { 
              tasks: {
                include: {
                  logged_times: {
                    include: {
                      worker: true
                    }
                  }
                }
              } 
            } 
          })
          let total_cost = 0.0

          db_location?.tasks.forEach((task) => {
            task.logged_times.forEach((lt) => {
              total_cost += (lt.time_seconds / 3600) * lt.worker.hourly_wage.toNumber()
            })
          })

          expect(Math.ceil(total_cost)).to.eq(Math.ceil(location.total_cost))
        })
      })
    })

    describe("with filter applied", () => {
      describe("on locations", () => {
        it("should combine only the related records", async () => {

        })
      })
      
      describe("on workers", () => {
        it("should combine only the related records", async () => {

        })
      })
    })
  })
})
