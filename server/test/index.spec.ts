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
    const query = gql`
      query Locations {
        locations { 
          id
          name 
        }
      }
    `

    const response = await request(server)
      .post('/')
      .send({
          query: print(query)
      })
      .set('Accept', 'application/json')
    
    const body = response.body

    expect(body).to.have.property('data')
    expect(body.data).to.have.property('locations').that.is.an('array')

    const location = body.data.locations[0]
    expect(location).to.have.property('id')
    expect(location).to.have.property('name')
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

    const variables = {
      ids: [1],
      location_ids: [1],
      complete: false
    }

    const response = await request(server)
      .post('/')
      .send({
          query: print(query), 
          variables
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
