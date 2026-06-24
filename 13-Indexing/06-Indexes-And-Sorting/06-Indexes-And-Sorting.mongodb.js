/*
|--------------------------------------------------------------------------
| LESSON 06 - INDEXES AND SORTING
|--------------------------------------------------------------------------
|
| Goal:
| Understand how indexes help MongoDB avoid expensive sorting.
|
| Without Index:
| MongoDB may need to sort documents manually.
|
| With Index:
| MongoDB can read data in already sorted order.
|
*/

/*
|--------------------------------------------------------------------------
| Sample Data - YouTube Videos
|--------------------------------------------------------------------------
*/

db.videos.insertMany([
  {
    title: "MongoDB Tutorial",
    views: 1000
  },
  {
    title: "Node.js Tutorial",
    views: 5000
  },
  {
    title: "React Tutorial",
    views: 3000
  },
  {
    title: "Express Tutorial",
    views: 8000
  },
  {
    title: "Next.js Tutorial",
    views: 6000
  }
]);

/*
|--------------------------------------------------------------------------
| Sorting Without An Index
|--------------------------------------------------------------------------
|
| MongoDB may:
|
| 1. Read documents
| 2. Sort them
| 3. Return results
|
*/

db.videos.find().sort({
  views: -1
});

/*
|--------------------------------------------------------------------------
| Check Query Execution Plan
|--------------------------------------------------------------------------
|
| Look for:
|
| COLLSCAN
| SORT
|
*/

db.videos.find().sort({
  views: -1
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Creating An Index For Sorting
|--------------------------------------------------------------------------
|
| Most viewed videos should appear first.
|
*/

db.videos.createIndex({
  views: -1
});

/*
|--------------------------------------------------------------------------
| Verify Existing Indexes
|--------------------------------------------------------------------------
*/

db.videos.getIndexes();

/*
|--------------------------------------------------------------------------
| Sorting After Creating Index
|--------------------------------------------------------------------------
|
| MongoDB can now use the index.
|
*/

db.videos.find().sort({
  views: -1
});

/*
|--------------------------------------------------------------------------
| Verify Index Usage
|--------------------------------------------------------------------------
|
| Look for:
|
| IXSCAN
|
*/

db.videos.find().sort({
  views: -1
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Ascending Sorting
|--------------------------------------------------------------------------
|
| Lowest views first.
|
*/

db.videos.find().sort({
  views: 1
});

/*
|--------------------------------------------------------------------------
| Interesting Fact
|--------------------------------------------------------------------------
|
| Even though the index was created using:
|
| { views: -1 }
|
| MongoDB can still traverse it in reverse
| and support ascending sorting.
|
*/

db.videos.find().sort({
  views: 1
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Real World Example - E-Commerce
|--------------------------------------------------------------------------
*/

db.products.insertMany([
  {
    name: "MacBook Air",
    category: "Laptop",
    price: 90000
  },
  {
    name: "ThinkPad",
    category: "Laptop",
    price: 80000
  },
  {
    name: "Dell XPS",
    category: "Laptop",
    price: 100000
  },
  {
    name: "iPhone",
    category: "Mobile",
    price: 70000
  }
]);

/*
|--------------------------------------------------------------------------
| Sorting Products By Price
|--------------------------------------------------------------------------
*/

db.products.find().sort({
  price: 1
});

/*
|--------------------------------------------------------------------------
| Create Index On Price
|--------------------------------------------------------------------------
|
| Useful when users frequently sort products
| by price.
|
*/

db.products.createIndex({
  price: 1
});

/*
|--------------------------------------------------------------------------
| Verify Index Usage
|--------------------------------------------------------------------------
*/

db.products.find().sort({
  price: 1
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Compound Index Example
|--------------------------------------------------------------------------
|
| Category + Price
|
| MongoDB organizes:
|
| category
|      ↓
| price
|
*/

db.products.createIndex({
  category: 1,
  price: 1
});

/*
|--------------------------------------------------------------------------
| Filter + Sort Query
|--------------------------------------------------------------------------
|
| A very common e-commerce query.
|
| Show only laptops and sort them by price.
|
*/

db.products.find({
  category: "Laptop"
}).sort({
  price: 1
});

/*
|--------------------------------------------------------------------------
| Verify Query Plan
|--------------------------------------------------------------------------
*/

db.products.find({
  category: "Laptop"
}).sort({
  price: 1
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Leaderboard Example
|--------------------------------------------------------------------------
*/

db.players.insertMany([
  {
    username: "vivek",
    score: 4500
  },
  {
    username: "alex",
    score: 7000
  },
  {
    username: "emma",
    score: 6200
  },
  {
    username: "rohit",
    score: 8200
  }
]);

/*
|--------------------------------------------------------------------------
| Create Leaderboard Index
|--------------------------------------------------------------------------
|
| Highest score should appear first.
|
*/

db.players.createIndex({
  score: -1
});

/*
|--------------------------------------------------------------------------
| Top Players
|--------------------------------------------------------------------------
*/

db.players.find().sort({
  score: -1
});

/*
|--------------------------------------------------------------------------
| Verify Index Usage
|--------------------------------------------------------------------------
*/

db.players.find().sort({
  score: -1
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Key Learning
|--------------------------------------------------------------------------
|
| Without Index:
|
| Find Data
|      ↓
| Sort Data
|      ↓
| Return Data
|
|
| With Index:
|
| Read Index
|      ↓
| Return Data
|
|
| Indexes help MongoDB:
|
| ✅ Find Faster
| ✅ Sort Faster
|
|
| Common Sorting Fields:
|
| - views
| - score
| - price
| - createdAt
| - followers
|
|
| Always think:
|
| "What fields are users sorting on frequently?"
|
| Those fields are often great index candidates.
|
*/