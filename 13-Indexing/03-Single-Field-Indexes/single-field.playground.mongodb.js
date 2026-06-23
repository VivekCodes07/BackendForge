/*
|--------------------------------------------------------------------------
| LESSON 03 - SINGLE FIELD INDEXES
|--------------------------------------------------------------------------
|
| Goal:
| Understand how a Single Field Index works and which queries
| can benefit from it.
|
| A Single Field Index creates a shortcut for ONE field only.
|
*/

/*
|--------------------------------------------------------------------------
| Sample Data
|--------------------------------------------------------------------------
*/

db.users.insertMany([
  {
    username: "vivek",
    email: "vivek@gmail.com",
    followers: 1200
  },
  {
    username: "cristiano",
    email: "cr7@gmail.com",
    followers: 600000000
  },
  {
    username: "emma",
    email: "emma@gmail.com",
    followers: 4500
  },
  {
    username: "alex",
    email: "alex@gmail.com",
    followers: 800
  }
]);

/*
|--------------------------------------------------------------------------
| Creating A Single Field Index
|--------------------------------------------------------------------------
|
| Here I am creating an index on username.
|
| MongoDB will maintain a shortcut for username values only.
|
*/

db.users.createIndex({
  username: 1
});

/*
|--------------------------------------------------------------------------
| View Existing Indexes
|--------------------------------------------------------------------------
|
| MongoDB automatically creates an _id index.
| After creating username index, I should see both.
|
*/

db.users.getIndexes();

/*
|--------------------------------------------------------------------------
| Query That Can Use The Index
|--------------------------------------------------------------------------
|
| Since username is indexed, MongoDB can use IXSCAN
| instead of scanning every document.
|
*/

db.users.find({
  username: "vivek"
});

/*
|--------------------------------------------------------------------------
| Verify Index Usage
|--------------------------------------------------------------------------
|
| Look for:
| - IXSCAN
| - totalDocsExamined
|
*/

db.users.find({
  username: "vivek"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Another Query Using The Same Index
|--------------------------------------------------------------------------
|
| MongoDB can still use the username index because
| username is the field being searched.
|
*/

db.users.find({
  username: "cristiano"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Query That Cannot Use The Username Index
|--------------------------------------------------------------------------
|
| The index contains username values, not follower counts.
|
| Therefore MongoDB may need a COLLSCAN.
|
*/

db.users.find({
  followers: 1200
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Creating Another Single Field Index
|--------------------------------------------------------------------------
|
| Suppose users frequently log in using email.
|
| It makes sense to create an index on email.
|
*/

db.users.createIndex({
  email: 1
});

/*
|--------------------------------------------------------------------------
| Query Using Email Index
|--------------------------------------------------------------------------
*/

db.users.find({
  email: "vivek@gmail.com"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Creating A Descending Single Field Index
|--------------------------------------------------------------------------
|
|  1 => Ascending
| -1 => Descending
|
| For equality searches both work fine.
|
*/

db.users.createIndex({
  followers: -1
});

/*
|--------------------------------------------------------------------------
| Check All Available Indexes
|--------------------------------------------------------------------------
*/

db.users.getIndexes();

/*
|--------------------------------------------------------------------------
| Testing Followers Query Again
|--------------------------------------------------------------------------
|
| Now followers is indexed.
|
| MongoDB should be able to use the followers index.
|
*/

db.users.find({
  followers: 1200
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Real World Example - Instagram
|--------------------------------------------------------------------------
|
| Users frequently search:
|
|   username
|
| So indexing username makes sense.
|
*/

db.instagramUsers.insertMany([
  {
    username: "cristiano",
    verified: true
  },
  {
    username: "leomessi",
    verified: true
  },
  {
    username: "virat.kohli",
    verified: true
  }
]);

db.instagramUsers.createIndex({
  username: 1
});

db.instagramUsers.find({
  username: "leomessi"
});

/*
|--------------------------------------------------------------------------
| Key Learning
|--------------------------------------------------------------------------
|
| Single Field Index:
|
|   { username: 1 }
|
| Creates a shortcut for ONE field.
|
| Helps queries that search using that field.
|
| Does NOT automatically help other fields.
|
| Examples:
|
|   username -> username index ✅
|   email    -> username index ❌
|   followers -> username index ❌
|
| Always create indexes based on query patterns,
| not randomly.
|
*/