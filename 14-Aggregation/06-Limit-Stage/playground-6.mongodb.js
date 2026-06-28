/*
══════════════════════════════════════════════════════════════════════════════════
                             PLAYGROUND — $limit STAGE
══════════════════════════════════════════════════════════════════════════════════

Today I learned the $limit stage.

Unlike $sort,

it doesn't change the order of documents.

Unlike $match,

it doesn't filter documents based on a condition.

Instead...

$limit simply controls how many documents
continue through the aggregation pipeline.

Once the specified number of documents is reached,

MongoDB stops.
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
01. RETURN THE FIRST N DOCUMENTS
══════════════════════════════════════════════════════════════════════════════════

Syntax

{
    $limit: 2
}

MongoDB starts reading documents.

Execution

iPhone      ✅
MacBook     ✅

Stop.

Notice

✓ No documents are modified.
✓ No filtering happens.
✓ MongoDB simply stops after returning two documents.
*/

db.products.aggregate([
    {
        $limit: 2
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
02. WHY CURRENT ORDER MATTERS
══════════════════════════════════════════════════════════════════════════════════

$limit does NOT know which document is

• Cheapest
• Most Expensive
• Highest Rated

It only knows the current order
of the incoming documents.

Current Order

1. iPhone
2. MacBook
3. Chair
4. Table
5. Keyboard

Applying

{
    $limit: 3
}

Result

✓ iPhone
✓ MacBook
✓ Chair

Stop.
*/

db.products.aggregate([
    {
        $limit: 3
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
03. COMBINING $sort AND $limit
══════════════════════════════════════════════════════════════════════════════════

Question

How do I get the two most expensive products?

Step 1

Sort by price.

↓

Step 2

Return only the first two documents.

Execution

Collection
      │
      ▼

Sort by Price (Descending)
      │
      ▼

MacBook
iPhone
Table
Chair
Keyboard

      │
      ▼

Apply $limit

      │
      ▼

MacBook ✅
iPhone  ✅

Stop.
*/

db.products.aggregate([
    {
        $sort: {
            price: -1
        }
    },
    {
        $limit: 2
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
04. STAGE ORDER MATTERS
══════════════════════════════════════════════════════════════════════════════════

Pipeline A

$limit

↓

$sort

MongoDB thinks

Take the first two documents.

↓

Sort ONLY those two.

----------------------------------------

Pipeline B

$sort

↓

$limit

MongoDB thinks

Sort ALL documents.

↓

Take the first two.

These pipelines can produce
completely different results.
*/

db.products.aggregate([
    {
        $limit: 2
    },
    {
        $sort: {
            price: -1
        }
    }
]);



db.products.aggregate([
    {
        $sort: {
            price: -1
        }
    },
    {
        $limit: 2
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
05. USING $limit AFTER $group
══════════════════════════════════════════════════════════════════════════════════

Remember

$group creates summary documents.

Those summaries become the input
for the next stage.

Execution

Collection
      │
      ▼

$group
      │
      ▼

[
    { _id: "Electronics", totalRevenue: 3100 },
    { _id: "Furniture", totalRevenue: 800 }
]

      │
      ▼

$sort

      │
      ▼

$limit

      │
      ▼

Return the highest revenue category.
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
    },
    {
        $limit: 1
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
06. REAL-WORLD EXAMPLE
══════════════════════════════════════════════════════════════════════════════════

Imagine you're building an e-commerce homepage.

You only want to display

Top 3 Highest Rated Products.

Pipeline

Sort by rating.

↓

Return only three documents.
*/

db.products.aggregate([
    {
        $sort: {
            rating: -1
        }
    },
    {
        $limit: 3
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
MENTAL MODEL
══════════════════════════════════════════════════════════════════════════════════

Whenever I see

{
    $limit: N
}

I imagine MongoDB doing this.

┌──────────────────────────────┐
│ Documents from Previous Stage│
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Count Documents              │
└──────────────┬───────────────┘
               │
               ▼
     1 ✅
     2 ✅
     3 ✅
     ...
     N ✅

Stop.

Pass only those documents
to the next stage.
*/



/*
══════════════════════════════════════════════════════════════════════════════════
QUICK NOTES
══════════════════════════════════════════════════════════════════════════════════

✓ $limit returns the first N documents.

✓ It never changes document data.

✓ It never changes document order.

✓ $limit depends on the order of
  the incoming documents.

✓ That's why $sort usually comes
  before $limit.

✓ Aggregation stages execute
  from top to bottom.
*/



/*
══════════════════════════════════════════════════════════════════════════════════
BIGGEST TAKEAWAY
══════════════════════════════════════════════════════════════════════════════════

Whenever I see

{
    $limit: 5
}

I don't think

"Return the best five documents."

I think

"Return the first five documents
from the current pipeline."

The keyword is

CURRENT ORDER.

If I want the "top" documents,

I should first use

$sort

and then

$limit.
*/