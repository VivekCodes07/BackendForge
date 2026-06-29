/*
══════════════════════════════════════════════════════════════════════════════════
                           PLAYGROUND — $unwind STAGE
══════════════════════════════════════════════════════════════════════════════════

Today I learned the $unwind stage.

Unlike the previous stages,

$unwind can increase the number of documents
flowing through the aggregation pipeline.

It takes an array field and creates
a new document for each element inside that array.
*/



/*
══════════════════════════════════════════════════════════════════════════════════
                              SAMPLE COLLECTION
══════════════════════════════════════════════════════════════════════════════════
*/

db.users.drop();

db.users.insertMany([
    {
        name: "John",
        hobbies: ["Gaming", "Reading", "Coding"]
    },
    {
        name: "Emma",
        hobbies: ["Cooking", "Traveling"]
    },
    {
        name: "Alex",
        hobbies: ["Photography"]
    },
    {
        name: "Sarah",
        hobbies: []
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
01. MY FIRST $unwind
══════════════════════════════════════════════════════════════════════════════════

Before

John

Gaming
Reading
Coding

↓

After

John - Gaming
John - Reading
John - Coding

One document becomes
multiple documents.
*/

db.users.aggregate([
    {
        $unwind: "$hobbies"
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
02. FIND USERS WHO LIKE CODING
══════════════════════════════════════════════════════════════════════════════════

Execution

$unwind

↓

$match

Once every hobby becomes its own document,

filtering becomes much easier.
*/

db.users.aggregate([
    {
        $unwind: "$hobbies"
    },
    {
        $match: {
            hobbies: "Coding"
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
03. COUNT USERS FOR EACH HOBBY
══════════════════════════════════════════════════════════════════════════════════

Execution

Collection

↓

$unwind

↓

$group

Result

Gaming      → 1

Reading     → 1

Coding      → 1

Cooking     → 1

Traveling   → 1

Photography → 1
*/

db.users.aggregate([
    {
        $unwind: "$hobbies"
    },
    {
        $group: {
            _id: "$hobbies",
            totalUsers: {
                $sum: 1
            }
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
04. SORT HOBBIES ALPHABETICALLY
══════════════════════════════════════════════════════════════════════════════════

After unwinding,

every hobby becomes a normal field.

That means it can be sorted
just like any other value.
*/

db.users.aggregate([
    {
        $unwind: "$hobbies"
    },
    {
        $sort: {
            hobbies: 1
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
05. PRESERVE EMPTY ARRAYS
══════════════════════════════════════════════════════════════════════════════════

Normally,

documents with empty arrays disappear.

Setting

preserveNullAndEmptyArrays: true

keeps them in the pipeline.
*/

db.users.aggregate([
    {
        $unwind: {
            path: "$hobbies",
            preserveNullAndEmptyArrays: true
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
MENTAL MODEL
══════════════════════════════════════════════════════════════════════════════════

One Document

{
    hobbies: [
        "Gaming",
        "Reading",
        "Coding"
    ]
}

            │
            ▼

$unwind

            │
            ▼

Document 1

{
    hobbies: "Gaming"
}

Document 2

{
    hobbies: "Reading"
}

Document 3

{
    hobbies: "Coding"
}

One document

↓

Many documents.
*/



/*
══════════════════════════════════════════════════════════════════════════════════
BIGGEST TAKEAWAY
══════════════════════════════════════════════════════════════════════════════════

Whenever I see

{
    $unwind: "$arrayField"
}

I don't think

"Split the array."

I think

"Create one document
for every element
inside the array."

That's what makes $unwind
one of the most unique
aggregation stages.
*/