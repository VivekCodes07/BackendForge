/*
═══════════════════════════════════════════════════════════════════════════════
                            PLAYGROUND — $skip STAGE
═══════════════════════════════════════════════════════════════════════════════

Today I learned the $skip stage.

$skip doesn't delete documents.

$skip doesn't filter documents.

It simply ignores the first N documents
flowing through the aggregation pipeline.

The remaining documents continue
to the next stage.
*/



/*
═══════════════════════════════════════════════════════════════════════════════
                             SAMPLE COLLECTION
═══════════════════════════════════════════════════════════════════════════════
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
═══════════════════════════════════════════════════════════════════════════════
01. SKIP THE FIRST TWO DOCUMENTS
═══════════════════════════════════════════════════════════════════════════════

Current Order

iPhone
MacBook
Chair
Table
Keyboard

↓

Skip 2

↓

Chair
Table
Keyboard
*/

db.products.aggregate([
    {
        $skip: 2
    }
]);



/*
═══════════════════════════════════════════════════════════════════════════════
02. SORT FIRST, THEN SKIP
═══════════════════════════════════════════════════════════════════════════════

Sort by price (Highest → Lowest)

MacBook
iPhone
Table
Chair
Keyboard

↓

Skip 2

↓

Table
Chair
Keyboard
*/

db.products.aggregate([
    {
        $sort: {
            price: -1
        }
    },
    {
        $skip: 2
    }
]);



/*
═══════════════════════════════════════════════════════════════════════════════
03. SKIP + LIMIT (Pagination)
═══════════════════════════════════════════════════════════════════════════════

Imagine

Page Size = 2

Skip first 2 products.

↓

Return next 2 products.
*/

db.products.aggregate([
    {
        $skip: 2
    },
    {
        $limit: 2
    }
]);



/*
═══════════════════════════════════════════════════════════════════════════════
MENTAL MODEL
═══════════════════════════════════════════════════════════════════════════════

Collection
     │
     ▼

Skip the first N documents

     │
     ▼

Pass the remaining documents
to the next stage.

Remember

$sort  → Arrange

$skip  → Ignore

$limit → Return
*/



/*
═══════════════════════════════════════════════════════════════════════════════
BIGGEST TAKEAWAY
═══════════════════════════════════════════════════════════════════════════════

Whenever I see

{
    $skip: N
}

I don't think

"Delete N documents."

I think

"Ignore the first N documents
in the current pipeline."
*/