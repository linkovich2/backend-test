# The Process

### Forward
Thanks for this opportunity team! I'm actually really excited after meeting everyone to come on board. I'll explain some of my thought process for this application below - and I'm happy to go over any of this in our review!

### Choosing the Approach
After looking over the prompt and the repo I came to a few conclusions:
1. The associations are begging for an ORM to handle performant queries for us
2. I went back and forth on this for a while in my planning phase, but ultimately GraphQL was chosen over REST since users can specify how they want the data to be presented, as opposed to needing to have resources for any uniquely compiled data (even computed).

I need to gather a few packages so we're not reinventing the wheel for no reason. Firstly, for our ORM I found [Prisma](https://www.prisma.io/orm). I'm not familiar with it, but it seemed simple enough to implement so we'll go with that! It even handles migrations with its schema file, which is a big step above using a SQL file. 

Secondly, we'll go with express-validator (sanitizing query strings) and helmet (headers) for security. That should cover most of the needs of this application that I'm aware of.

Last but not least, we need a testing framework. I went with Mocha and Chai, as it somewhat resembles rspec and I'm kinda used to that.

Alright, with the planning phase done, time to spec things out!

### First Steps
- Get Prisma hooked up to MariaDB. This was a bigger pain than initially expected, but eventually got it working with migrations. So swapped out the migration script with prisma. To get everything set up you run: `docker-compose exec server npx prisma migrate dev`
- Add a migration for complete status of tasks
- Get typescript running properly

### The Meat of the Project
Now normally by this point I'd be working on getting specs in place, but I'm not 100% on how prisma integrates with graphql and how that will be structured, nor am I 100% on how best to test this, so for me that means a little experimentation is in order. And tests will have to be last. I want to stress that in normal development situations I would at least get an outline into my specs before actually writing any code. It helps keep on track and in scope. But this one is admittedly charting some new territory for me.

So the first big exploration for me is getting our GraphQL schema in place and manually testing some things, as well as tying that in with my prisma resolvers.

Following GraphQL being setup will be seeds so we can test, and iterate on any issues!

### Testing and Iterations
`docker-compose exec server npx prisma db seed` to seed the database with random location data, then testing and iterating at this point.