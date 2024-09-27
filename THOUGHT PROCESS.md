# The Process

### Forward
Thanks for this opportunity team! I'm actually really excited after meeting everyone to come on board. I'll explain some of my thought process for this application below - and I'm happy to go over any of this in our review!

### Choosing the Approach
After looking over the prompt and the repo I came to a few conclusions:
1. The associations are begging for an ORM to handle performant queries for us
2. I went back and forth on this for a while in my planning phase, but ultimately GraphQL was chosen over REST since users can specify how they want the data to be presented, as opposed to needing to have resources for any uniquely compiled data (even computed), plus it lowers the number of repeated requests.

I need to gather a few packages so we're not reinventing the wheel for no reason. Firstly, for our ORM I found [Prisma](https://www.prisma.io/orm). I'm not familiar with it, but it seemed simple enough to implement so we'll go with that! It even handles migrations with its schema file, which is a big step above using a SQL file. It's also compatible with GraphQL out of the box, so that's a huge plus.

Secondly, we'll go with express-validator (sanitizing input) and helmet (headers) for security. That should cover most of the needs of this application that I'm aware of.

Last but not least, we need a testing framework. I went with Mocha and Chai, as it somewhat resembles rspec and I'm kinda used to that.

Alright, with the planning phase done, time to spec things out!

### First Steps
- Get Prisma hooked up to MariaDB. This was a bigger pain than initially expected, but eventually got it working with migrations. So I swapped out the original migration script with prisma. To get everything set up you run: `docker-compose exec server npx prisma migrate dev`
- Add a migration for complete status of tasks
- Get typescript set up

### The Meat of the Project
Now normally by this point I'd be working on getting specs in place, but I'm not 100% on how prisma integrates with graphql and how that will be structured, nor am I 100% on how best to test this, so for me that means a little experimentation is in order. And tests will have to be last. I want to stress that in normal development situations I would try to at least get an outline into my specs before actually writing any code. It helps keep on track and in scope. But sometimes strict BDD is just not feasible, and this project is admittedly charting some new territory for me.

So the first big exploration for me is getting our GraphQL schema in place and manually testing some things, as well as tying that in with my prisma resolvers.

Following GraphQL being setup will be seeds so we can test, and iterating on any issues!

### Testing and Iterations
1. `docker-compose exec server npx prisma db seed` to seed the database with random location data, and now just a cycle of testing and iterating! Ultimately the graphql endpoint is very flexible.
2. Next up is getting the `sum` portion of the API working correctly, it should sum together all joined costs so we can display that along with locations or workers.
3. After that, implementing some security middleware is always a good idea.
4. And finally, we're writing specs!

### Possible Improvements
1. Pagination, it is not currently implemented but would definitely be a requirement for larger datasets.
2. More filtering options, they are easy enough to add.
3. Logging. Access logs in APIs like this are a great way to track usage.
4. Performance tracking. NewRelic or something like it
5. Refactoring. My example here is hardly idiomatic (although I'm not sure there's a particular standard to adhere to in the Node world) - maybe organizing it in whatever standards we've implemented in other repos is a good idea for onboarding.

There are probably other improvements that can be made. This was a fun dive into GraphQL for me, as I didn't have much experience with it - generally I would have approached this with a REST solution, but I've done so much of that in my career and GraphQL had some interesting advantages for this use-case.

Thanks again for this opportunity! Can't wait to meet with you guys about the repo!