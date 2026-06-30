/*
═══════════════════════════════════════════════════════════════════════════════
                  PLAYGROUND — COMMON AGGREGATION OPERATORS
═══════════════════════════════════════════════════════════════════════════════

Until now, I've been using operators like $sum and $multiply
without really thinking about them.

This playground is just to practice the ones
I'll use the most.
*/

/*
═══════════════════════════════════════════════════════════════════════════════
                             SAMPLE COLLECTION
═══════════════════════════════════════════════════════════════════════════════
*/

db.products.drop();

db.products.insertMany([
  {
    name: "Mechanical Keyboard",
    brand: "KeyPro",
    category: "Accessories",
    price: 100,
    quantity: 3,
    discount: 15,
    tags: ["gaming", "wireless", "rgb"],
    createdAt: new Date("2025-01-15"),
  },
  {
    name: "Gaming Mouse",
    brand: "ClickX",
    category: "Accessories",
    price: 50,
    quantity: 5,
    discount: 5,
    tags: ["gaming", "lightweight"],
    createdAt: new Date("2025-03-20"),
  },
  {
    name: "Monitor",
    brand: "ViewMax",
    category: "Electronics",
    price: 1200,
    quantity: 2,
    discount: 100,
    tags: ["4K", "IPS"],
    createdAt: new Date("2024-11-08"),
  },
]);

/*
═══════════════════════════════════════════════════════════════════════════════
01. ARITHMETIC OPERATORS
═══════════════════════════════════════════════════════════════════════════════

$totalPrice = price × quantity

$finalPrice = price - discount
*/

db.products.aggregate([
  {
    $addFields: {
      totalPrice: {
        $multiply: ["$price", "$quantity"],
      },
      finalPrice: {
        $subtract: ["$price", "$discount"],
      },
    },
  },
]);

/*
═══════════════════════════════════════════════════════════════════════════════
02. STRING OPERATORS
═══════════════════════════════════════════════════════════════════════════════

Formatting text.
*/

db.products.aggregate([
  {
    $project: {
      name: 1,
      upperBrand: {
        $toUpper: "$brand",
      },
      lowerBrand: {
        $toLower: "$brand",
      },
      productLabel: {
        $concat: ["$brand", " - ", "$name"],
      },
    },
  },
]);

/*
═══════════════════════════════════════════════════════════════════════════════
03. ARRAY OPERATORS
═══════════════════════════════════════════════════════════════════════════════

Working with arrays.
*/

db.products.aggregate([
  {
    $project: {
      name: 1,
      totalTags: {
        $size: "$tags",
      },
      firstTag: {
        $first: "$tags",
      },
      lastTag: {
        $last: "$tags",
      },
    },
  },
]);

/*
═══════════════════════════════════════════════════════════════════════════════
04. CONDITIONAL OPERATORS
═══════════════════════════════════════════════════════════════════════════════

Premium or Budget?
*/

db.products.aggregate([
  {
    $addFields: {
      productType: {
        $cond: {
          if: {
            $gte: ["$price", 1000],
          },
          then: "Premium",
          else: "Budget",
        },
      },
    },
  },
]);

/*
═══════════════════════════════════════════════════════════════════════════════
05. DATE OPERATORS
═══════════════════════════════════════════════════════════════════════════════

Extract year and month.
*/

db.products.aggregate([
  {
    $project: {
      name: 1,
      year: {
        $year: "$createdAt",
      },
      month: {
        $month: "$createdAt",
      },
      day: {
        $dayOfMonth: "$createdAt",
      },
    },
  },
]);

/*
═══════════════════════════════════════════════════════════════════════════════
06. COMBINE A FEW OPERATORS
═══════════════════════════════════════════════════════════════════════════════

Looks closer to a real pipeline.
*/

db.products.aggregate([
  {
    $addFields: {
      totalPrice: {
        $multiply: ["$price", "$quantity"],
      },
      productType: {
        $cond: {
          if: {
            $gte: ["$price", 1000],
          },
          then: "Premium",
          else: "Budget",
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      name: 1,
      totalPrice: 1,
      productType: 1,
      totalTags: {
        $size: "$tags",
      },
    },
  },
]);

/*
═══════════════════════════════════════════════════════════════════════════════
MENTAL MODEL
═══════════════════════════════════════════════════════════════════════════════

Aggregation Stage

↓

Aggregation Operator

↓

Updated Result

Stages control the flow.

Operators do the work.
*/
