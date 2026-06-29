/*
══════════════════════════════════════════════════════════════════════════════════
                  PLAYGROUND — $addFields, $set & $unset
══════════════════════════════════════════════════════════════════════════════════

Today I learned how to temporarily modify documents
inside the aggregation pipeline.

These stages DO NOT modify the original collection.

Instead,

they create a modified version of each document
that flows to the next stage.

Think of it like editing a copy,
not the original.
*/



/*
══════════════════════════════════════════════════════════════════════════════════
                              SAMPLE COLLECTION
══════════════════════════════════════════════════════════════════════════════════
*/

db.products.drop();

db.products.insertMany([
    {
        name: "Mechanical Keyboard",
        category: "Accessories",
        price: 100,
        quantity: 3
    },
    {
        name: "Gaming Mouse",
        category: "Accessories",
        price: 50,
        quantity: 5
    },
    {
        name: "Monitor",
        category: "Electronics",
        price: 300,
        quantity: 2
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
01. MY FIRST $addFields
══════════════════════════════════════════════════════════════════════════════════

Let's start simple.

I just want to add a new field
to every document.

Nothing gets stored in MongoDB.

The new field only exists
inside the aggregation result.
*/

db.products.aggregate([
    {
        $addFields: {
            inStock: true
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
02. CREATE A CALCULATED FIELD
══════════════════════════════════════════════════════════════════════════════════

Instead of adding a static value,

I can calculate one.

totalPrice = price × quantity
*/

db.products.aggregate([
    {
        $addFields: {
            totalPrice: {
                $multiply: [
                    "$price",
                    "$quantity"
                ]
            }
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
03. $set DOES THE SAME THING
══════════════════════════════════════════════════════════════════════════════════

I thought $set was different.

Turns out,

it's just another way of writing $addFields.
*/

db.products.aggregate([
    {
        $set: {
            currency: "USD"
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
04. REPLACE AN EXISTING FIELD
══════════════════════════════════════════════════════════════════════════════════

If the field already exists,

MongoDB replaces its value
inside the pipeline.

The original collection
is still untouched.
*/

db.products.aggregate([
    {
        $set: {
            price: 999
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
05. REMOVE A FIELD
══════════════════════════════════════════════════════════════════════════════════

Sometimes I don't want
certain fields in the final result.

That's where $unset comes in.
*/

db.products.aggregate([
    {
        $unset: "quantity"
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
06. COMBINE EVERYTHING
══════════════════════════════════════════════════════════════════════════════════

Flow

Receive Product

↓

Calculate totalPrice

↓

Add currency

↓

Remove quantity

↓

Return cleaner document
*/

db.products.aggregate([
    {
        $addFields: {
            totalPrice: {
                $multiply: [
                    "$price",
                    "$quantity"
                ]
            }
        }
    },
    {
        $set: {
            currency: "USD"
        }
    },
    {
        $unset: "quantity"
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
MENTAL MODEL
══════════════════════════════════════════════════════════════════════════════════

Collection

        │
        ▼

Create a temporary copy

        │
        ▼

Add / Update fields

        │
        ▼

Remove unwanted fields

        │
        ▼

Pass the updated document
to the next stage.

The original collection
never changes.
*/



/*
══════════════════════════════════════════════════════════════════════════════════
BIGGEST TAKEAWAY
══════════════════════════════════════════════════════════════════════════════════

Whenever I see

$addFields

or

$set

I think,

"Create or update fields
on a temporary copy."

Whenever I see

$unset

I think,

"Hide fields I don't want
in the final result."

These stages shape the output,

not the collection.
*/