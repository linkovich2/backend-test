# Thought Process

### Forward
Thanks for this opportunity team! I'm actually really excited after meeting everyone to come on board. I'll explain some of my thought process for this application below - and I'm happy to go over any of this in our review!

### Choosing the Approach
After looking over the prompt and the repo I came to a few conclusions:
1. The associations are begging for an ORM to handle performant queries for us
2. Initially, I thought GraphQL may be preferable to avoid multiple requests, but since additional filtering would result in additional requests anyway, and the division of RESTful resources makes a lot of sense structurally for how an application might use this API, I thought it made sense to stick with REST. So given that, our routes become fairly obvious based on the nested nature of the resources:
`/location_reports/:location_id` - this route lets us handle `By location: the total labor cost for tasks tied to a given location`
`/worker_reports/:worker_id` - this route lets us handle `By worker: the total cost of that worker across all tasks and locations`

Why those instead of `locations` and `workers`? Because technically that wouldn't be in line with RESTful practices - `locations` is reserved for _only_ returning location information. Whereas here we're looking for the total money spent on hours worked by location or worker - so this is essentially a different resource, I'll call it a report. It also let's us more senisibly include a query option of `status:incomplete|complete|all`. However this does necessitate a middleware to handle user input through the query string.

I need to gather a few packages so we're not reinventing the wheel for no reason. Firstly, for our ORM I found [Prisma](https://www.prisma.io/orm). I'm not familiar with it, but it seemed simple enough to implement so we'll go with that! It even handles migrations with its schema file, which is a big step above using a SQL file. 

Secondly, we'll go with express-validator (sanitizing query strings) and helmet (headers) for security. That should cover most of the needs of this application that I'm aware of.

Last but not least, we need a testing framework. I went with Mocha and Chai, as it somewhat resembles rspec and I'm kinda used to that.

Alright, with the planning phase done, time to spec things out!
