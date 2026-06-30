```js
// Switch to database
use("myDb");

/* =====================================================
   BASIC QUERY (Find + Sort)
===================================================== */

// Find Apple products and show selected fields, sorted by price (descending)
db.products.find(
  { name: "Apple" },
  { name: 1, price: 1, category: 1, brand: 1 }
).sort({ price: -1 });


/* =====================================================
   AGGREGATION: FILTER + PROJECT + SORT
===================================================== */

db.products.aggregate([
  // Step 1: Filter only Apple products
  {
    $match: { brand: "Apple" }
  },

  // Step 2: Select required fields
  {
    $project: {
      name: 1,
      category: 1,
      brand: 1,
      price: 1
    }
  },

  // Step 3: Sort by price (high → low)
  {
    $sort: { price: -1 }
  }
]);


/* =====================================================
   AGGREGATION: AVERAGE RATING
===================================================== */

// Get Mobile products with average rating
db.products.aggregate([
  {
    $match: { category: "Mobile" }
  },
  {
    $project: {
      name: 1,
      category: 1,
      averageRating: { $avg: "$ratings" }
    }
  }
]);


/* =====================================================
   GROUPING ($group)
===================================================== */

// Group products by category and calculate stats
db.products.aggregate([
  {
    $group: {
      // Group key (creates buckets)
      _id: "$category",

      // Total price of all items in category
      totalRevenue: { $sum: "$price" },

      // Average price in category
      avgPrice: { $avg: "$price" },

      // Count of items
      itemCount: { $sum: 1 },

      // Collect product details in array
      details: {
        $push: {
          productName: "$name",
          price: "$price"
        }
      }
    }
  }
]);

/*
MENTAL MODEL:
Collection → Group into buckets → Apply calculations → Output one document per group
*/


/* =====================================================
   PROJECT TRANSFORMATIONS
===================================================== */

db.products.aggregate([
  {
    $project: {
      _id: 0,                 // Hide _id
      name: 1,
      price: 1,

      // Convert name to uppercase
      productName: { $toUpper: "$name" },

      // Add static field
      inStock: "True",

      // Add 999 to price
      totalPrice: { $sum: ["$price", 999] }
    }
  },
  {
    $sort: { price: 1 } // Sort low → high
  }
]);


/* =====================================================
   LOOKUP (JOIN)
===================================================== */

// Join orders with products collection
db.orders.aggregate([
  {
    $lookup: {
      from: "products",                // Collection to join
      localField: "products.productId", // Field in orders
      foreignField: "_id",              // Field in products
      as: "productDetails"              // Output array
    }
  }
]);


/* =====================================================
   UNWIND (ARRAY → DOCUMENTS)
===================================================== */

// Break tags array into multiple documents
db.products.aggregate([
  {
    $unwind: "$tags"
  }
]);


/* =====================================================
   COMPLETE PIPELINE (UNWIND + LOOKUP)
===================================================== */

db.orders.aggregate([
  // Step 1: Keep only products field
  {
    $project: {
      products: 1
    }
  },

  // Step 2: Convert each product into separate document
  {
    $unwind: "$products"
  },

  // Step 3: Join with products collection
  {
    $lookup: {
      from: "products",
      localField: "products.productId",
      foreignField: "_id",
      as: "productDetails"
    }
  }

  // Optional:
  // Add this if you want a single object instead of array
  // { $unwind: "$productDetails" }
]);
```
