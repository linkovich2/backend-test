# Installation

## Docker

To set up the environment, you will need to first install [Docker](https://docs.docker.com/engine/install/).
This test uses Docker Compose to run everything.

## Backend Server

The backend server uses Node.js, but you don't need to have that installed on your machine. You can install
the dependencies by running:

```bash
docker compose run server npm i
```

## Database

To bring up the database:

```bash
docker compose up -d db
```

Once it's ready to go, you can run the schema migrator to build the schema:

```bash
docker compose exec server npx prisma migrate dev
```

And to seed:

```bash
docker-compose exec server npx prisma db seed
```

If that fails (because of something like an already existing table), you can always start with a clean slate
by bringing the DB container down:

```bash
docker compose down
```

## Testing
```bash
docker-compose exec server npm test
```

Try hitting `localhost:3000/` in postman. Here's a sample query (make sure to seed first):
```
query Locations($ids: [Int!] = [1]) {
    locations(ids: $ids) {
        id
        name
        tasks {
            id
            complete
            description
            logged_times {
                id
                time_seconds
                worker {
                    id
                    username
                    hourly_wage
                    total_cost
                }
            }
        }
        total_cost(worker_ids: [1])
    }
}
```

## Further Reading
Take a look at my [process breakdown](./THOUGHT%20PROCESS.md) for some details about my thinking with this little project!