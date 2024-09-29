# The Process

### Forward
Thanks for this opportunity team! I'm actually really excited after meeting everyone to come on board. I'll explain some of my thought process for this application below - and I'm happy to go over any of this in our review!

### Choosing the Approach
After looking over the prompt and the repo I came to a few conclusions:
1. The associations are begging for an ORM to handle performant queries for us
2. I went back and forth on this for a while in my planning phase, but ultimately GraphQL was chosen over REST since users can specify how they want the data to be presented, as opposed to needing to have resources for any uniquely compiled data (even computed), plus it lowers the number of repeated requests.

I need to gather a few packages so we're not reinventing the wheel for no reason. Firstly, for our ORM I found [Prisma](https://www.prisma.io/orm). I'm not familiar with it, but it seemed simple enough to implement so we'll go with that! It even handles migrations with its schema file, which is a big step above using a SQL file. It's also compatible with GraphQL out of the box, so that's a huge plus.

A few other explanations:
- helmet handles some security settings involving headers, mostly just a set & forget for us for now
- express-graphql and graphql-tools help us set up our schema and route handler
- snaplet-seed integrates with prisma and automates our DB seeding so we can have a lot more data without me manually creating records or SQL

Last but not least, we need a testing framework. I'm going with Mocha, Chai and ~~Supertest~~ (ultimately went with GraphQL-Request, much cleaner for testing this API), as that configuration somewhat resembles rspec and I'm kinda used to that.

With planning out of the way, time to start slapping this thing together!

### First Steps
- Got Prisma hooked up to MariaDB. This was a bigger pain than initially expected, but eventually got it working with migrations. So I swapped out the original migration script with prisma. To get everything set up you now run: `docker-compose exec server npx prisma migrate dev`
- Added a migration for complete status of tasks
- Got typescript configured

### The Meat of the Project
Now normally by this point I'd be working on getting specs in place, but I'm not 100% on how prisma integrates with graphql and how that will be structured, nor am I 100% on how best to test this, so for me that means a little experimentation is in order. And tests will have to be last. In normal development situations I would try to at least get an outline into my specs before actually writing any code. It helps me keep on track and in scope. But sometimes strict BDD is just not feasible, and this project is admittedly charting some new territory for me.

The first big exploration for me was getting our GraphQL schema in place and manually testing some things, as well as tying that in with my prisma resolvers. Once the main filters were working, I spent the bulk of the time trying to figure out a good standard for showing the total cost for locations / workers. I tried a few in-built prisma options (models, extending results with computed fields), but they didn't really work with our GraphQL setup, so eventually I settled on the solution we have now.

After that, I just tried some different seeding options and kept testing and iterating a few things. Everything seemed to be working as expected so lastly I just got the specs in place and polished here and there.

### Possible Improvements
1. Pagination, it is not currently implemented but would definitely be a requirement for larger datasets.
2. More filtering options, they are easy enough to add.
3. Logging. Access logs in APIs like this are a great way to track usage.
4. Performance tracking. NewRelic or something like it
5. Refactoring. My example here is hardly idiomatic (although I'm not sure there's a particular standard to adhere to in the Node world) - maybe organizing it in whatever standards we've implemented in other repos is a good idea for onboarding.
6. Tests can _always_ be expanded.

There are probably other improvements that can be made. This was a fun dive into GraphQL for me, as I didn't have much experience with it - generally I would have approached this with a REST solution, but I've done so much of that in my career and GraphQL had some interesting advantages for this use-case.

Thanks again for this opportunity! Can't wait to meet with you guys about the repo!