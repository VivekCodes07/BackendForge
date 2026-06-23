/*
|--------------------------------------------------------------------------
| LESSON 01 - WHY INDEXES?
|--------------------------------------------------------------------------
|
| Goal:
| Understand why indexes are needed and how MongoDB searches
| for documents with and without an index.
|
*/

/*
|--------------------------------------------------------------------------
| Sample Data
|--------------------------------------------------------------------------
*/

db.users.insertMany([
  {
    username: "john",
    followers: 120
  },
  {
    username: "emma",
    followers: 450
  },
  {
    username: "cristiano",
    followers: 600000000
  },
  {
    username: "alex",
    followers: 200
  }
]);

/*
|--------------------------------------------------------------------------
| Query Without Index
|--------------------------------------------------------------------------
|
| At this point MongoDB has no shortcut for username.
|
| To find "cristiano", MongoDB may scan documents one by one.
|
| This is known as:
| COLLSCAN (Collection Scan)
|
*/

db.users.find({
  username: "cristiano"
});

/*
|--------------------------------------------------------------------------
| Checking The Query Plan
|--------------------------------------------------------------------------
|
| explain() helps me understand how MongoDB executes a query.
|
| Since no index exists yet, I should see COLLSCAN.
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
| "Please maintain a shortcut for username
| so future searches become faster."
|
*/

db.users.createIndex({
  username: 1
});

/*
|--------------------------------------------------------------------------
| Running The Same Query Again
|--------------------------------------------------------------------------
|
| The result is identical.
|
| The difference is in HOW MongoDB finds the document.
|
*/

db.users.find({
  username: "cristiano"
});

/*
|--------------------------------------------------------------------------
| Verify Index Usage
|--------------------------------------------------------------------------
|
| This time MongoDB should prefer IXSCAN
| (Index Scan) instead of COLLSCAN.
|
*/

db.users.find({
  username: "cristiano"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Another Example
|--------------------------------------------------------------------------
|
| Searching by a field that does NOT have an index.
|
| MongoDB may still perform a collection scan.
|
*/

db.users.find({
  followers: 450
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Key Learning
|--------------------------------------------------------------------------
|
| Without Index:
|   COLLSCAN
|   MongoDB checks documents one by one.
|
| With Index:
|   IXSCAN
|   MongoDB uses a shortcut.
|
| Indexes improve read performance by helping MongoDB
| avoid scanning the entire collection.
|
*/