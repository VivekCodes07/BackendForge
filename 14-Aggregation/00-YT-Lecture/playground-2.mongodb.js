use("myDb");

/*
db.products.find(
    {name: "Apple"},
    {name: 1, price: 1, category: 1, brand: 1}
).sort({price: -1})
*/

db.products.aggregate([
  {
    $match: { brand: "Apple" },
  },
  {
    $project: { name: 1, category: 1, brand: 1, price: 1 },
  },
  {
    $sort: { price: -1 },
  },
]);

// Filter Mobile category products amd then show name, category, and average rating from ratings.
db.products.aggregate([
  {
    $match: { category: "Mobile" },
  },
  {
    $project: {
      name: 1,
      category: 1,
      averageRating: { $avg: "$ratings" },
    },
  },
]);

// ----------- $group -------------
db.products.aggregate([
  {
    $group: {
      /*
       * Step 1:
       * Group all documents by their category.
       *
       * Internally, MongoDB creates temporary buckets like:
       *
       * Electronics
       * ├── { iPhone, 1000 }
       * └── { MacBook, 2000 }
       *
       * Furniture
       * ├── { Chair, 300 }
       * └── { Table, 500 }
       *
       * These buckets are temporary—they don't appear in the final output.
       * Instead, MongoDB uses them so accumulator operators can process
       * the documents inside each bucket.
       */
      _id: "$category",

      /*
       * MongoDB looks inside the current bucket and
       * adds the price of every document.
       */
      totalRevenue: {
        $sum: "$price",
      },

      /*
       * MongoDB looks inside the same bucket and
       * calculates the average price.
       */
      avgPrice: {
        $avg: "$price",
      },

      /*
       * MongoDB visits every document in the bucket
       * and adds 1 for each document.
       *
       * Document 1 -> +1
       * Document 2 -> +1
       * ...
       *
       * This is why $sum: 1 is commonly used to count documents.
       */
      itemCount: {
        $sum: 1,
      },

      /*
       * MongoDB iterates over every document in the bucket
       * and pushes this object into an array.
       *
       * For the Electronics bucket:
       * [
       *   { productName: "iPhone", price: 1000 },
       *   { productName: "MacBook", price: 2000 }
       * ]
       */
      details: {
        $push: {
          productName: "$name",
          price: "$price",
        },
      },
    },
  },
]);

/*
 * Mental Model:
 *
 * Collection
 *     ↓
 * $group creates temporary buckets
 *     ↓
 * Each accumulator ($sum, $avg, $push, etc.)
 * works on one bucket at a time
 *     ↓
 * One bucket = One output document
 */


db.products.aggregate([
  {
    $project: {
      name: 1,
      price: 1,
      _id: 0,
      productName: {$toUpper: "$name"},
      inStock: "True",
      totalPrice: {
        $sum: ["$price", 999]
      },
    }
  },
  {
    $sort: {
      price: 1
    }
  }
])