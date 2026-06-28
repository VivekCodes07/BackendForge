/*
══════════════════════════════════════════════════════════════════════════════════
                              PLAYGROUND — $sort STAGE
══════════════════════════════════════════════════════════════════════════════════

Today I learned the $sort stage.

Unlike $match,
it doesn't filter documents.

Unlike $project,
it doesn't reshape documents.

Unlike $group,
it doesn't summarize data.

Instead...

$sort simply changes the order of the documents
flowing through the aggregation pipeline.

The documents themselves never change.

Only their order changes.
*/



/*
══════════════════════════════════════════════════════════════════════════════════
                              SAMPLE COLLECTION
══════════════════════════════════════════════════════════════════════════════════
*/

db.products.drop();

db.products.insertMany([
    {
        name: "iPhone",
        category: "Electronics",
        price: 1000,
        rating: 4.8
    },
    {
        name: "MacBook",
        category: "Electronics",
        price: 2000,
        rating: 4.9
    },
    {
        name: "Chair",
        category: "Furniture",
        price: 300,
        rating: 4.4
    },
    {
        name: "Table",
        category: "Furniture",
        price: 500,
        rating: 4.6
    },
    {
        name: "Keyboard",
        category: "Electronics",
        price: 100,
        rating: 4.5
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
01. SORT DOCUMENTS IN ASCENDING ORDER
══════════════════════════════════════════════════════════════════════════════════

Syntax

{
    $sort: {
        price: 1
    }
}

1 → Ascending Order

MongoDB compares the value of "price"
for every document and sorts them
from the smallest value to the largest value.

Execution

100
 │
 ▼
300
 │
 ▼
500
 │
 ▼
1000
 │
 ▼
2000

Remember

✓ Documents are NOT modified.
✓ Only their order changes.
*/

db.products.aggregate([
    {
        $sort: {
            price: 1
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
02. SORT DOCUMENTS IN DESCENDING ORDER
══════════════════════════════════════════════════════════════════════════════════

Syntax

{
    $sort: {
        price: -1
    }
}

-1 → Descending Order

MongoDB compares the value of "price"
for every document and sorts them
from the largest value to the smallest value.

Execution

2000
 │
 ▼
1000
 │
 ▼
500
 │
 ▼
300
 │
 ▼
100

Quick Trick

1  → Lowest → Highest

-1 → Highest → Lowest
*/

db.products.aggregate([
    {
        $sort: {
            price: -1
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
03. SORT BY MULTIPLE FIELDS
══════════════════════════════════════════════════════════════════════════════════

Syntax

{
    $sort: {
        category: 1,
        price: -1
    }
}

MongoDB processes sort keys
from LEFT ➜ RIGHT.

Execution

Sort by category
        │
        ▼

Electronics

Furniture

        │
        ▼

Within each category,
sort by price.

Result

Electronics
    MacBook
    iPhone
    Keyboard

Furniture
    Table
    Chair
*/

db.products.aggregate([
    {
        $sort: {
            category: 1,
            price: -1
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
04. SORT BY ANOTHER FIELD
══════════════════════════════════════════════════════════════════════════════════

$sort isn't limited to numbers.

As long as MongoDB can compare values,
it can sort them.

Here we're sorting by rating.
*/

db.products.aggregate([
    {
        $sort: {
            rating: -1
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
05. USING $sort AFTER $group
══════════════════════════════════════════════════════════════════════════════════

Remember from the previous lesson.

$group creates temporary buckets.

Those buckets become output documents.

Now $sort receives those documents.

Execution

Collection
     │
     ▼

$group
     │
     ▼

[
    {
        _id: "Electronics",
        totalRevenue: 3100
    },
    {
        _id: "Furniture",
        totalRevenue: 800
    }
]

     │
     ▼

$sort

     │
     ▼

Ordered Summary Documents

Notice

$sort is NOT sorting the original collection.

It's sorting the documents
produced by $group.
*/

db.products.aggregate([
    {
        $group: {
            _id: "$category",

            totalRevenue: {
                $sum: "$price"
            }
        }
    },
    {
        $sort: {
            totalRevenue: -1
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
06. SORT BY MULTIPLE FIELDS AFTER $group
══════════════════════════════════════════════════════════════════════════════════

Suppose two categories have the same revenue.

MongoDB first compares

totalRevenue

If they're equal,

it compares

totalProducts

This is called secondary sorting.
*/

db.products.aggregate([
    {
        $group: {
            _id: "$category",

            totalRevenue: {
                $sum: "$price"
            },

            totalProducts: {
                $sum: 1
            }
        }
    },
    {
        $sort: {
            totalRevenue: -1,
            totalProducts: -1
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
MENTAL MODEL
══════════════════════════════════════════════════════════════════════════════════

Whenever I see

{
    $sort: {
        ...
    }
}

I imagine MongoDB doing this.

┌──────────────────────────────┐
│   Documents from Previous    │
│            Stage             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Compare Field Values       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│     Arrange Documents        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Pass to the Next Stage       │
└──────────────────────────────┘
*/



/*
══════════════════════════════════════════════════════════════════════════════════
QUICK NOTES
══════════════════════════════════════════════════════════════════════════════════

✓ 1  → Ascending Order

✓ -1 → Descending Order

✓ MongoDB processes sort keys
  from LEFT ➜ RIGHT.

✓ $sort doesn't modify documents.

✓ $sort only changes their order.

✓ Every aggregation stage receives
  the output of the previous stage.
*/



/*
══════════════════════════════════════════════════════════════════════════════════
BIGGEST TAKEAWAY
══════════════════════════════════════════════════════════════════════════════════

Whenever I see

{
    $sort: { ... }
}

I don't think

"Sort the collection."

I think

"Take the documents produced by the previous stage,
order them, and pass them to the next stage."

That simple mental model makes the $sort stage
much easier to understand.
*/