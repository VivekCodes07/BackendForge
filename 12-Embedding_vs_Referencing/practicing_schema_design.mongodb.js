use("myDb")

/*
=================================================
LESSON 18 - EMBEDDING
=================================================

Embedding means storing related data inside the
same document.

Good when:
- Data belongs together
- Data is small
- Data is usually read together
*/

db.users.insertOne({
  username: "vivek",
  email: "vivek@gmail.com",

  address: {
    city: "Jhumri Telaiya",
    state: "Jharkhand",
    pin: 825410
  },

  preferences: {
    theme: "dark",
    language: "English"
  },

  subscription: {
    plan: "Premium",
    screens: 4,
    monthlyPrice: 999
  }
})

/*
When fetching the user, MongoDB returns
everything in a single document.

This is a good use case for embedding because:
- Address belongs to user
- Preferences belong to user
- Subscription belongs to user
*/

db.users.find({ username: "vivek" })



/*
=================================================
LESSON 19 - REFERENCING
=================================================

Referencing means storing data in separate
collections and connecting them using IDs.

Useful when data can grow forever.
*/

/*
Users Collection
*/

db.users.insertOne({
  _id: ObjectId(),
  username: "john",
  email: "john@gmail.com"
})

/*
Assume this user's _id is:

ObjectId("64a1b2c3d4e5f67890123456")

We will use that id in posts collection.
*/


/*
Posts Collection
*/

db.posts.insertMany([
  {
    userId: ObjectId("64a1b2c3d4e5f67890123456"),
    caption: "Beautiful Sunset",
    likes: 150
  },

  {
    userId: ObjectId("64a1b2c3d4e5f67890123456"),
    caption: "Learning MongoDB",
    likes: 200
  }
])

/*
Notice:

Posts are NOT embedded inside user.

Instead we store:

userId

This creates a relationship between:

User -> Posts
*/


db.posts.find({
  userId: ObjectId("64a1b2c3d4e5f67890123456")
})



/*
=================================================
LESSON 20 - EMBEDDING VS REFERENCING
=================================================
*/

/*
CASE 1

User Address

Question:
Can address grow forever?

No

Decision:
Embed
*/

db.users.insertOne({
  username: "emma",

  address: {
    city: "London",
    country: "UK"
  }
})



/*
CASE 2

Instagram Followers

Question:
Can followers grow forever?

Yes

Decision:
Reference
*/

db.followers.insertMany([
  {
    userId: ObjectId("u1"),
    followerId: ObjectId("u2")
  },

  {
    userId: ObjectId("u1"),
    followerId: ObjectId("u3")
  }
])



/*
CASE 3

Netflix Subscription

Question:
Does subscription belong to user?

Yes

Question:
Is it small and usually read together?

Yes

Decision:
Embed
*/

db.users.insertOne({
  username: "alex",

  subscription: {
    plan: "Premium",
    screens: 4
  }
})



/*
CASE 4

Movie Reviews

Question:
Can reviews become very large?

Yes

Decision:
Reference
*/

db.movies.insertOne({
  _id: ObjectId("m1"),
  title: "Interstellar",
  year: 2014
})

db.reviews.insertMany([
  {
    movieId: ObjectId("m1"),
    user: "John",
    rating: 5,
    review: "Masterpiece"
  },

  {
    movieId: ObjectId("m1"),
    user: "Emma",
    rating: 4,
    review: "Amazing visuals"
  }
])



/*
=================================================
MY MENTAL MODEL
=================================================

If data is:

- Small
- Limited
- Belongs together
- Read together

=> Embed


If data is:

- Large
- Growing constantly
- Independent
- One-to-Many relationship

=> Reference


Examples:

Embed:
- Address
- Preferences
- Subscription
- Settings

Reference:
- Posts
- Followers
- Comments
- Reviews
- Orders
- Transactions
*/