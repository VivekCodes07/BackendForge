/*
══════════════════════════════════════════════════════════════════════════════════
                           PLAYGROUND — $lookup STAGE
══════════════════════════════════════════════════════════════════════════════════

Today I learned the $lookup stage.

Unlike the previous aggregation stages,

$lookup doesn't filter, sort, or reshape documents.

Instead,

it fetches related documents from another collection
and temporarily attaches them to the current document.

Think of it like saying,

"For every document I'm processing,
go find its related document from another collection."
*/



/*
══════════════════════════════════════════════════════════════════════════════════
                              SAMPLE COLLECTIONS
══════════════════════════════════════════════════════════════════════════════════
*/

db.users.drop();
db.orders.drop();

db.users.insertMany([
    {
        _id: 1,
        name: "John",
        city: "New York"
    },
    {
        _id: 2,
        name: "Emma",
        city: "London"
    },
    {
        _id: 3,
        name: "Alex",
        city: "Toronto"
    }
]);

db.orders.insertMany([
    {
        _id: 101,
        userId: 1,
        product: "Keyboard",
        price: 120
    },
    {
        _id: 102,
        userId: 2,
        product: "Mouse",
        price: 60
    },
    {
        _id: 103,
        userId: 1,
        product: "Monitor",
        price: 350
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
01. MY FIRST $lookup
══════════════════════════════════════════════════════════════════════════════════

Orders Collection

↓

Read userId

↓

Search users collection

↓

Attach matching user
*/

db.orders.aggregate([
    {
        $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
02. WHY DOES $lookup RETURN AN ARRAY?
══════════════════════════════════════════════════════════════════════════════════

Result

user: [
    {
        _id: 1,
        name: "John"
    }
]

Even if only one document matches,

MongoDB always returns an array.

This keeps the output consistent.
*/

db.orders.aggregate([
    {
        $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
03. COMBINING $lookup AND $unwind
══════════════════════════════════════════════════════════════════════════════════

Before

user: [
    {
        name: "John"
    }
]

↓

$unwind

↓

user: {
    name: "John"
}

Now the joined document
becomes a normal object.
*/

db.orders.aggregate([
    {
        $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
        }
    },
    {
        $unwind: "$user"
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
04. FIND ORDERS PLACED BY JOHN
══════════════════════════════════════════════════════════════════════════════════

Execution

$lookup

↓

$unwind

↓

$match

Join first,

then filter using the joined data.
*/

db.orders.aggregate([
    {
        $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
        }
    },
    {
        $unwind: "$user"
    },
    {
        $match: {
            "user.name": "John"
        }
    }
]);



/*
══════════════════════════════════════════════════════════════════════════════════
MENTAL MODEL
══════════════════════════════════════════════════════════════════════════════════

Current Order

        │
        ▼

Read userId

        │
        ▼

Search Users Collection

        │
        ▼

Find Matching User

        │
        ▼

Attach User Information

        │
        ▼

Pass Updated Document
to the next stage.
*/



/*
══════════════════════════════════════════════════════════════════════════════════
BIGGEST TAKEAWAY
══════════════════════════════════════════════════════════════════════════════════

Whenever I see

{
    $lookup: { ... }
}

I don't think

"Merge two collections."

I think

"For each document,
find its related document
from another collection
and attach it temporarily."

The original collections
are never modified.
*/