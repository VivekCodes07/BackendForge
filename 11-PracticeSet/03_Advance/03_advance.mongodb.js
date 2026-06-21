use("snapdeal");

// ======================================================
// FIND QUERIES
// ======================================================

// 61. Find products where ANY review has user = "Rahul"
db.products.find({
  "reviews.user": "Rahul",
});

// 62. Find products where at least one review document matches
db.products.find({
  reviews: {
    $elemMatch: { user: "Rahul" },
  },
});

// 63. Find products where Rahul gave rating 5
db.products.find({
  reviews: {
    $elemMatch: {
      user: "Rahul",
      rating: 5,
    },
  },
});

// 64. Find products having any review with rating >= 4
db.products.find({
  "reviews.rating": { $gte: 4 },
});

// 65. Find products having at least one review with rating >= 4
db.products.find({
  reviews: {
    $elemMatch: {
      rating: { $gte: 4 },
    },
  },
});

// 66. Find products having more than 2 reviews
db.products.find({
  $expr: {
    $gt: [{ $size: "$reviews" }, 2],
  },
});

// 67. Find products whose price > 5000 and stock < 10
db.products.find({
  $and: [{ price: { $gt: 5000 } }, { stock: { $lt: 10 } }],
});

// 68. Find products whose discount is between 10 and 30
db.products.find({
  $and: [{ discount: { $gt: 10 } }, { discount: { $lt: 30 } }],
});

// 69. Find products whose name starts with "G"
db.products.find({
  name: /^G/,
});

// 70. Find products whose name ends with "Laptop"
db.products.find({
  name: /Laptop$/,
});

// 71. Find products containing "gaming" tag
db.products.find({
  tags: { $in: ["gaming"] },
});

// 72. Find products having both "gaming" and "electronics" tags
db.products.find({
  tags: { $all: ["gaming", "electronics"] },
});

// 73. Find products having exactly 3 tags
db.products.find({
  tags: { $size: 3 },
});

// 74. Find products where stock is an even number
db.products.find({
  stock: { $mod: [2, 0] },
});

// 75. Find products where name length > 10 characters
db.products.find({
  $expr: {
    $gt: [{ $strLenCp: "$name" }, 10],
  },
});

// 76. Find products where discount field exists
db.products.find({
  discount: { $exists: true },
});

// 77. Find products where any review has rating < 3
db.products.find({
  "reviews.rating": { $lt: 3 },
});

// 78. Find products where all review ratings are >= 4
db.products.find({
  reviews: {
    $not: {
      $elemMatch: {
        rating: { $lt: 4 },
      },
    },
  },
});

// 79. Find products where Rahul exists in reviews
db.products.find({
  reviews: {
    $elemMatch: {
      user: "Rahul",
    },
  },
});

// 80. Find product with highest stock
db.products.find().sort({ stock: -1 }).limit(1);

// 81. Find products where Rahul reviewed and rating < 3
db.products.find({
  reviews: {
    $elemMatch: {
      user: "Rahul",
      rating: { $lt: 3 },
    },
  },
});

// 82. Find products where price > stock
db.products.find({
  $expr: {
    $gt: ["$price", "$stock"],
  },
});

// ======================================================
// UPDATE QUERIES
// ======================================================

// 83. Add a new review to a product
db.products.updateOne(
  { name: "Office Laptop" },
  {
    $push: {
      reviews: {
        user: "Vivek",
        rating: 5,
      },
    },
  },
);

// 84. Update Rahul's review rating
db.products.updateOne(
  {
    "reviews.user": "Rahul",
  },
  {
    $set: {
      "reviews.$.rating": 1,
    },
  },
);

/*
Step 1: Find first product containing Rahul's review
Step 2: Locate matched review object
Step 3: $ points to matched review
Step 4: Update its rating
*/

// 85. Remove review written by Amit
db.products.updateOne(
  { name: "Gaming Laptop" },
  {
    $pull: {
      reviews: {
        user: "Amit",
      },
    },
  },
);

// 86. Add multiple tags to a product
db.products.updateOne(
  { name: "Gaming Laptop" },
  {
    $addToSet: {
      tags: {
        $each: ["digital", "RGB"],
      },
    },
  },
);

// 87. Remove tag "gaming"
db.products.updateOne(
  { name: "Gaming Laptop" },
  {
    $pull: {
      tags: "gaming",
    },
  },
);

// 88. Add tag "sale" where discount > 10
db.products.updateMany(
  {
    discount: { $gt: 10 },
  },
  {
    $addToSet: {
      tags: "sale",
    },
  },
);

// 89. Add review only if product has less than 5 reviews
db.products.updateMany(
  {
    $expr: {
      $lt: [{ $size: "$reviews" }, 5],
    },
  },
  {
    $push: {
      reviews: {
        user: "John",
        rating: 5,
      },
    },
  },
);

// 90. Find products where discount is missing or 0.
db.products.find({
  $or: [{ discount: { $exists: false } }, { discount: 0 }],
});

// 91. Find products where name length is > category length.
db.products.find({
  $expr: {
    $gt: [{ $strLenCp: "$name" }, { $strLenCp: "$category" }],
  },
});

// 92. Find orders where amount > 50000 and status delivered.
db.products.find({
  $and: [{ price: { $gt: 5000 } }, { status: "delivered" }],
});

// 93. Find products where stock is between 5 and 20 but not 10.
db.products.find({
  $and: [{ stock: { $gt: 5 } }, { stock: { $lt: 20 } }, { stock: { $ne: 10 } }],
});

// 94. Find products where either discount > 20 OR stock < 5.
db.products.find({
  $or: [{ discount: { $gt: 20 } }, { stock: { $lt: 5 } }],
});

// 95. Find products where tags include "gaming" but not "mobile".
db.products.find({
  tags: {
    $in: ["gaming"],
    $nin: ["mobile"],
  },
});

// 96. Find products where review count > 2 and < 5.
db.products.find({
  $expr: {
    $and: [
      { $gt: [{ $size: "$reviews" }, 2] },
      { $lt: [{ $size: "$reviews" }, 5] },
    ],
  },
});

// 97. Find products where no review has raitng < 3.
db.products.find({
  reviews: {
    $not: {
      $elemMatch: {
        rating: { $lt: 3 }
      }
    }
  }
});