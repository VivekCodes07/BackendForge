/*
|--------------------------------------------------------------------------
| LESSON 04 - COMPOUND INDEXES
|--------------------------------------------------------------------------
|
| Goal:
| Understand how Compound Indexes work and why field order
| matters when designing indexes.
|
| A Compound Index indexes multiple fields together.
|
*/

/*
|--------------------------------------------------------------------------
| Sample Data
|--------------------------------------------------------------------------
*/

db.orders.insertMany([
  {
    orderId: "ORD-1001",
    customerId: 101,
    status: "Delivered",
    amount: 1200
  },
  {
    orderId: "ORD-1002",
    customerId: 101,
    status: "Pending",
    amount: 800
  },
  {
    orderId: "ORD-1003",
    customerId: 102,
    status: "Delivered",
    amount: 1500
  },
  {
    orderId: "ORD-1004",
    customerId: 103,
    status: "Cancelled",
    amount: 500
  },
  {
    orderId: "ORD-1005",
    customerId: 101,
    status: "Delivered",
    amount: 2500
  }
]);

/*
|--------------------------------------------------------------------------
| Query Before Creating Any Index
|--------------------------------------------------------------------------
|
| MongoDB may perform a COLLSCAN because no custom index
| exists yet.
|
*/

db.orders.find({
  customerId: 101,
  status: "Delivered"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Creating A Compound Index
|--------------------------------------------------------------------------
|
| I frequently search orders using:
|
| customerId + status
|
| So creating a compound index makes sense.
|
*/

db.orders.createIndex({
  customerId: 1,
  status: 1
});

/*
|--------------------------------------------------------------------------
| View Available Indexes
|--------------------------------------------------------------------------
*/

db.orders.getIndexes();

/*
|--------------------------------------------------------------------------
| Query Using Both Indexed Fields
|--------------------------------------------------------------------------
|
| This is the ideal query for our index.
|
*/

db.orders.find({
  customerId: 101,
  status: "Delivered"
});

/*
|--------------------------------------------------------------------------
| Verify Index Usage
|--------------------------------------------------------------------------
|
| Look for:
| - IXSCAN
| - low totalDocsExamined
|
*/

db.orders.find({
  customerId: 101,
  status: "Delivered"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Understanding The Prefix Rule
|--------------------------------------------------------------------------
|
| Index:
|
| { customerId: 1, status: 1 }
|
| MongoDB organizes data:
|
| customerId
|      ↓
| status
|
*/

/*
|--------------------------------------------------------------------------
| Query Using First Field Only
|--------------------------------------------------------------------------
|
| Can use the compound index.
|
| This follows the Prefix Rule.
|
*/

db.orders.find({
  customerId: 101
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Query Using Both Fields
|--------------------------------------------------------------------------
|
| Can use the compound index efficiently.
|
*/

db.orders.find({
  customerId: 101,
  status: "Pending"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Query Using Second Field Only
|--------------------------------------------------------------------------
|
| This usually cannot efficiently use:
|
| { customerId: 1, status: 1 }
|
| because the first field is skipped.
|
*/

db.orders.find({
  status: "Delivered"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Real World Example - Netflix
|--------------------------------------------------------------------------
*/

db.movies.insertMany([
  {
    title: "Interstellar",
    genre: "Sci-Fi",
    year: 2014
  },
  {
    title: "Inception",
    genre: "Sci-Fi",
    year: 2010
  },
  {
    title: "The Dark Knight",
    genre: "Action",
    year: 2008
  }
]);

/*
|--------------------------------------------------------------------------
| Compound Index For Genre + Year
|--------------------------------------------------------------------------
|
| Useful when users search:
|
| "Show me Sci-Fi movies from 2014"
|
*/

db.movies.createIndex({
  genre: 1,
  year: 1
});

db.movies.find({
  genre: "Sci-Fi",
  year: 2014
});

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
    name: "iPhone",
    category: "Mobile",
    price: 70000
  }
]);

/*
|--------------------------------------------------------------------------
| Compound Index For Filtering + Sorting
|--------------------------------------------------------------------------
|
| MongoDB can:
| 1. Filter by category
| 2. Sort by price
|
| using the same index.
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
| Key Learning
|--------------------------------------------------------------------------
|
| Single Field Index:
|
|   { customerId: 1 }
|
| Compound Index:
|
|   { customerId: 1, status: 1 }
|
| Field order matters.
|
| Prefix Rule:
|
|   customerId ✅
|   customerId + status ✅
|   status only ❌
|
| Always design compound indexes based on
| real query patterns.
|
*/