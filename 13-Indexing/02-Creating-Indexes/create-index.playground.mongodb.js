/*
|--------------------------------------------------------------------------
| LESSON 02 - CREATING INDEXES
|--------------------------------------------------------------------------
|
| Goal:
| Learn how to create indexes in MongoDB and understand what
| MongoDB does when I ask it to maintain a shortcut for a field.
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
| Query Before Creating Any Index
|--------------------------------------------------------------------------
|
| MongoDB can find the document.
|
| But it may need to scan documents one by one because
| no shortcut exists yet.
|
*/

db.users.find({
  username: "cristiano"
});

/*
|--------------------------------------------------------------------------
| Check Query Execution Plan
|--------------------------------------------------------------------------
|
| Since no custom index exists yet, MongoDB may perform
| a COLLSCAN (Collection Scan).
|
*/

db.users.find({
  username: "cristiano"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Creating My First Index
|--------------------------------------------------------------------------
|
| I am telling MongoDB:
|
| "Please maintain a shortcut for the username field."
|
*/

db.users.createIndex({
  username: 1
});

/*
|--------------------------------------------------------------------------
| Verify Existing Indexes
|--------------------------------------------------------------------------
|
| MongoDB automatically creates the _id index.
| After creating username index, I should now see two indexes.
|
*/

db.users.getIndexes();

/*
|--------------------------------------------------------------------------
| Run The Same Query Again
|--------------------------------------------------------------------------
|
| Result remains the same.
|
| The difference is that MongoDB can now use the username
| index instead of scanning every document.
|
*/

db.users.find({
  username: "cristiano"
});

/*
|--------------------------------------------------------------------------
| Check Query Execution Plan Again
|--------------------------------------------------------------------------
|
| This time MongoDB should prefer an IXSCAN
| (Index Scan).
|
*/

db.users.find({
  username: "cristiano"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Creating Another Index
|--------------------------------------------------------------------------
|
| Suppose users frequently search by email.
|
| It makes sense to create an index on email as well.
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
});

/*
|--------------------------------------------------------------------------
| Creating A Descending Index
|--------------------------------------------------------------------------
|
| 1  => Ascending
| -1 => Descending
|
| For simple searches both work.
| Direction becomes more important for sorting.
|
*/

db.users.createIndex({
  followers: -1
});

/*
|--------------------------------------------------------------------------
| View All Indexes
|--------------------------------------------------------------------------
|
| At this point I should have:
|
| 1. _id index
| 2. username index
| 3. email index
| 4. followers index
|
*/

db.users.getIndexes();

/*
|--------------------------------------------------------------------------
| Inserting New Data
|--------------------------------------------------------------------------
|
| MongoDB automatically updates all relevant indexes.
|
| I don't need to manually update anything.
|
*/

db.users.insertOne({
  username: "sarah",
  email: "sarah@gmail.com",
  followers: 3200
});

/*
|--------------------------------------------------------------------------
| Updating Existing Data
|--------------------------------------------------------------------------
|
| MongoDB also updates indexes automatically during updates.
|
*/

db.users.updateOne(
  {
    username: "vivek"
  },
  {
    $set: {
      username: "vivek_sharma"
    }
  }
);

/*
|--------------------------------------------------------------------------
| Verify Updated Document
|--------------------------------------------------------------------------
*/

db.users.find({
  username: "vivek_sharma"
});

/*
|--------------------------------------------------------------------------
| Key Learning
|--------------------------------------------------------------------------
|
| createIndex() tells MongoDB to maintain a shortcut.
|
| { field: 1 }  => Ascending Index
| { field: -1 } => Descending Index
|
| Indexes help MongoDB avoid scanning every document.
|
| MongoDB automatically keeps indexes updated during:
|
| - insertOne()
| - insertMany()
| - updateOne()
| - updateMany()
| - replaceOne()
|
*/