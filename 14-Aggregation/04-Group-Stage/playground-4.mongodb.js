/*
===============================================================================
                            PLAYGROUND - $group
===============================================================================

Today I learned the stage that makes the Aggregation Pipeline feel powerful.

Unlike $match or $project,

$group doesn't filter documents.
$group doesn't reshape documents.

It summarizes them.

The most important thing I learned is this:

MongoDB DOES NOT immediately calculate anything.

Instead...

Step 1:
Create temporary buckets.

Step 2:
Run accumulator operators ($sum, $avg, $max, etc.)
on each bucket.

Step 3:
Each bucket becomes ONE output document.

Once this mental model clicked,
the entire $group stage started making sense.
*/



// ============================================================================
// Sample Collection
// ============================================================================

db.products.drop();

db.products.insertMany([
    {
        name: "iPhone",
        category: "Electronics",
        price: 1000
    },
    {
        name: "MacBook",
        category: "Electronics",
        price: 2000
    },
    {
        name: "Chair",
        category: "Furniture",
        price: 300
    },
    {
        name: "Table",
        category: "Furniture",
        price: 500
    },
    {
        name: "Keyboard",
        category: "Electronics",
        price: 100
    }
]);



/*
===============================================================================
1. Understanding $group
===============================================================================

Suppose our collection contains:

Electronics
├── iPhone
├── MacBook
└── Keyboard

Furniture
├── Chair
└── Table

When MongoDB sees:

_id: "$category"

it internally creates temporary buckets.

Electronics
├── { iPhone, 1000 }
├── { MacBook, 2000 }
└── { Keyboard, 100 }

Furniture
├── { Chair, 300 }
└── { Table, 500 }

Notice something important.

The original documents STILL exist inside each bucket.

MongoDB doesn't return these buckets.

They're temporary.

It uses them so accumulator operators can process
the documents inside each bucket.

Without accumulators,
MongoDB only returns the bucket names.
*/

db.products.aggregate([
    {
        $group: {
            _id: "$category"
        }
    }
]);



/*
===============================================================================
2. Count Documents
===============================================================================

$sum: 1

MongoDB visits every document
inside the current bucket.

Electronics

Document 1 -> +1
Document 2 -> +1
Document 3 -> +1

Result = 3

Furniture

Document 1 -> +1
Document 2 -> +1

Result = 2
*/

db.products.aggregate([
    {
        $group: {
            _id: "$category",

            totalProducts: {
                $sum: 1
            }
        }
    }
]);



/*
===============================================================================
3. Sum Values
===============================================================================

Instead of adding 1,

MongoDB now adds the value
stored in the "price" field.

Electronics

1000
2000
100
----
3100

Furniture

300
500
----
800
*/

db.products.aggregate([
    {
        $group: {
            _id: "$category",

            totalRevenue: {
                $sum: "$price"
            }
        }
    }
]);



/*
===============================================================================
4. Average Values
===============================================================================

MongoDB again visits every document
inside the bucket.

Electronics

1000
2000
100
-------
1033.33

Furniture

300
500
------
400
*/

db.products.aggregate([
    {
        $group: {
            _id: "$category",

            averagePrice: {
                $avg: "$price"
            }
        }
    }
]);



/*
===============================================================================
5. Maximum Value
===============================================================================

MongoDB compares every document
inside the bucket.

Electronics

1000
2000
100

Highest = 2000
*/

db.products.aggregate([
    {
        $group: {
            _id: "$category",

            highestPrice: {
                $max: "$price"
            }
        }
    }
]);



/*
===============================================================================
6. Minimum Value
===============================================================================

MongoDB compares every document
inside the bucket.

Electronics

1000
2000
100

Lowest = 100
*/

db.products.aggregate([
    {
        $group: {
            _id: "$category",

            lowestPrice: {
                $min: "$price"
            }
        }
    }
]);



/*
===============================================================================
7. Collect Documents
===============================================================================

This is different from the previous accumulators.

Instead of calculating a number,

MongoDB visits every document
inside the bucket and pushes
a new object into an array.

Electronics

↓

[
    { name: "iPhone", price: 1000 },
    { name: "MacBook", price: 2000 },
    { name: "Keyboard", price: 100 }
]
*/

db.products.aggregate([
    {
        $group: {
            _id: "$category",

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
===============================================================================
8. Everything Together
===============================================================================

Remember...

MongoDB first creates buckets.

Then every accumulator works
on ONE bucket at a time.

Finally...

One bucket
        ↓
One output document.
*/

db.products.aggregate([
    {
        $group: {
            _id: "$category",

            totalRevenue: {
                $sum: "$price"
            },

            averagePrice: {
                $avg: "$price"
            },

            totalProducts: {
                $sum: 1
            },

            highestPrice: {
                $max: "$price"
            },

            lowestPrice: {
                $min: "$price"
            },

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
===============================================================================
MENTAL MODEL
===============================================================================

Collection

        │
        ▼

Create temporary buckets

Electronics
├── document
├── document
└── document

Furniture
├── document
└── document

        │
        ▼

Run accumulators

$sum
$avg
$min
$max
$push

        │
        ▼

Each bucket becomes ONE output document.

That's the entire idea behind $group.
*/