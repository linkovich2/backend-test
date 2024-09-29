import { expect } from 'chai'
import { create_server, ctx as context } from '../src/server.js'

import request from 'supertest'
import gql from 'graphql-tag'
import { print } from 'graphql/language/printer.js'

const server = create_server(3001)

describe('GraphQL API', () => {
  after(async () => {
    await server.close()
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
})
