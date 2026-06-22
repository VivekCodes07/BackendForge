use("udemyDB")

/*
=================================================
MONGODB REFERENCING - UDEMY EXAMPLE
=================================================

While learning MongoDB, I realized that
referencing is simply a way to connect
documents using IDs.

Think of Udemy.

We have:

1. Users
2. Courses

A user can enroll in many courses.

A course can have many users.

This is a Many-to-Many relationship.

The important question is:

Should I store course data inside every user?

The answer is NO.

Why?

Because courses are independent data.
A course can exist without a user.

Also, thousands of users can purchase
the same course.

Instead of duplicating course information,
MongoDB allows us to reference it.
*/


/*
=================================================
STEP 1 - CREATE USERS
=================================================

Users are stored separately.

Each user gets a unique _id.
*/

db.users.insertMany([
  {
    _id: ObjectId("685e5c8a9f3b2d4c7a1f1001"),
    username: "vivek",
    email: "vivek@gmail.com"
  },

  {
    _id: ObjectId("685e5c8a9f3b2d4c7a1f1002"),
    username: "john",
    email: "john@gmail.com"
  }
])


/*
Visualizing Users

u1 -> Vivek
u2 -> John
*/


db.users.find()


/*
=================================================
STEP 2 - CREATE COURSES
=================================================

Courses are also stored separately.

Notice:

There is no user information here.

Courses are independent entities.
*/

db.courses.insertMany([
  {
    _id: ObjectId("685e5d9b8c4a1e3f6b2c2001"),
    title: "MongoDB Mastery",
    price: 499
  },

  {
    _id: ObjectId("685e5d9b8c4a1e3f6b2c2002"),
    title: "Node.js Bootcamp",
    price: 799
  },

  {
    _id: ObjectId("685e5d9b8c4a1e3f6b2c2003"),
    title: "React Complete Guide",
    price: 999
  }
])


/*
Visualizing Courses

c1 -> MongoDB Mastery
c2 -> Node.js Bootcamp
c3 -> React Complete Guide
*/


db.courses.find()


/*
=================================================
STEP 3 - CREATE ENROLLMENTS
=================================================

This collection acts like a bridge.

Instead of storing entire course data
inside a user document,

we simply store:

userId
courseId

This is referencing.
*/

db.enrollments.insertMany([
  {
    userId: ObjectId("685e5c8a9f3b2d4c7a1f1001"),
    courseId: ObjectId("685e5d9b8c4a1e3f6b2c2001")
  },

  {
    userId: ObjectId("685e5c8a9f3b2d4c7a1f1001"),
    courseId: ObjectId("685e5d9b8c4a1e3f6b2c2002")
  },

  {
    userId: ObjectId("685e5c8a9f3b2d4c7a1f1002"),
    courseId: ObjectId("685e5d9b8c4a1e3f6b2c2001")
  }
])


/*
Visualizing Enrollments

u1 -> c1
u1 -> c2
u2 -> c1

Translated:

Vivek enrolled in MongoDB Mastery

Vivek enrolled in Node.js Bootcamp

John enrolled in MongoDB Mastery
*/


db.enrollments.find()


/*
=================================================
HOW I INTERPRET AN ENROLLMENT DOCUMENT
=================================================

When I see:

{
  userId: u1,
  courseId: c1
}

I DO NOT think:

Random IDs

I think:

Vivek enrolled in MongoDB Mastery
*/


/*
=================================================
WHY NOT EMBED COURSES INSIDE USER?
=================================================

Imagine this structure:
*/

const badDesign = {
  username: "vivek",

  courses: [
    {
      title: "MongoDB Mastery",
      price: 499
    },

    {
      title: "Node.js Bootcamp",
      price: 799
    }
  ]
}


/*
Problems:

1. Duplicate course data

Every user stores the same course information.

2. Updating becomes difficult

Suppose course price changes.

499 -> 699

Now thousands of user documents
need updates.

3. Wasted storage

MongoDB Mastery could be purchased
by 10,000 users.

Why store the same course 10,000 times?
*/


/*
=================================================
WHY REFERENCING IS BETTER HERE
=================================================

Store course once.
Store user once.

Connect them using IDs.

User
  ↓
Enrollment
  ↓
Course

This avoids duplication and keeps
the database clean.
*/


/*
=================================================
FIND ALL COURSES OF A USER
=================================================

Suppose I want all enrollments
of Vivek.
*/

db.enrollments.find({
  userId: ObjectId("685e5c8a9f3b2d4c7a1f1001")
})


/*
Result:

[
  { userId: u1, courseId: c1 },
  { userId: u1, courseId: c2 }
]

Meaning:

Vivek purchased:

- MongoDB Mastery
- Node.js Bootcamp
*/


/*
=================================================
MY FINAL MENTAL MODEL
=================================================

Embedding:

Store related data together.

Good for:

- Address
- Preferences
- Subscription
- Settings


Referencing:

Store data separately and connect
using IDs.

Good for:

- Courses
- Posts
- Followers
- Comments
- Reviews
- Orders


Golden Rule:

If data can be shared by many documents
or can grow indefinitely,

referencing is usually the better choice.
*/