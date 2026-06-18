use("myDb");

/*
╔══════════════════════════════════════════════════════════════╗
║                  MONGODB UPDATE OPERATORS                   ║
╚══════════════════════════════════════════════════════════════╝

Why do update operators exist?

Imagine a document like:

{
    name: "John",
    age: 25,
    city: "Delhi",
    loginCount: 10
}

If I want to change only the city,
I don't want to replace the entire document.

That's where update operators help.

They allow me to update only specific fields.

==================================================
CATEGORIES
==================================================

1. Field Update Operators
   - $set
   - $unset
   - $rename

2. Number Update Operators
   - $inc
   - $mul
   - $min
   - $max

3. Date Update Operators
   - $currentDate

4. Array Update Operators
   - $push
   - $addToSet
   - $pull
   - $pullAll
   - $pop
   - $each
*/


/*
╔══════════════════════════════════════════════════════════════╗
║                 FIELD UPDATE OPERATORS                      ║
╚══════════════════════════════════════════════════════════════╝
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. $set
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Create a field if it doesn't exist.
Update a field if it already exists.

Think:

"Set this field to this value."

Most used update operator.
*/

db.users.updateOne(
    { name: "John" },
    {
        $set: {
            city: "Chandigarh"
        }
    }
)

/*
Before

{
    name: "John"
}

After

{
    name: "John",
    city: "Chandigarh"
}
*/


/*
Update multiple fields at once.
*/

db.users.updateOne(
    { name: "John" },
    {
        $set: {
            city: "Chandigarh",
            isActive: true,
            role: "User"
        }
    }
)


/*
Real World Uses

✓ Update profile information

✓ Change order status

✓ Update product price

✓ Activate/deactivate users
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. $unset
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Remove a field completely.

Think:

"Delete this field."
*/

db.users.updateOne(
    { name: "John" },
    {
        $unset: {
            city: ""
        }
    }
)

/*
Before

{
    name: "John",
    city: "Delhi"
}

After

{
    name: "John"
}
*/


/*
Useful when:

✓ Removing deprecated fields

✓ Cleaning old data

✓ Updating schema structure
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. $rename
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Rename a field.

Think:

"Change field name but keep value."
*/

db.users.updateOne(
    { name: "John" },
    {
        $rename: {
            phone: "phoneNumber"
        }
    }
)

/*
Before

{
    phone: "9876543210"
}

After

{
    phoneNumber: "9876543210"
}
*/


/*
Useful during schema migrations.
*/


/*
╔══════════════════════════════════════════════════════════════╗
║                NUMBER UPDATE OPERATORS                      ║
╚══════════════════════════════════════════════════════════════╝
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. $inc
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Increase or decrease a number.

Think:

currentValue + givenValue
*/

db.products.updateOne(
    { name: "iPhone 15" },
    {
        $inc: {
            stock: 1
        }
    }
)

/*
Before

stock = 10

After

stock = 11
*/


/*
Decrease stock.
*/

db.products.updateOne(
    { name: "iPhone 15" },
    {
        $inc: {
            stock: -1
        }
    }
)

/*
Real World Uses

✓ Likes

✓ Views

✓ Login count

✓ Product stock

✓ Reward points
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. $mul
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Multiply current value.

Think:

currentValue × givenValue
*/

db.users.updateOne(
    { name: "John" },
    {
        $mul: {
            rewardPoints: 2
        }
    }
)

/*
Before

rewardPoints = 100

After

rewardPoints = 200
*/


/*
Useful when applying multipliers
or bonus rewards.
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. $min
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Update only if new value is smaller.

Think:

"Keep the smaller value."
*/

db.products.updateOne(
    { name: "iPhone 15" },
    {
        $min: {
            price: 70000
        }
    }
)

/*
Current Price = 80000

Result = 70000
*/


/*
Current Price = 60000

Result = No Change
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. $max
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Update only if new value is larger.

Think:

"Keep the larger value."
*/

db.products.updateOne(
    { name: "iPhone 15" },
    {
        $max: {
            price: 90000
        }
    }
)

/*
Current Price = 80000

Result = 90000
*/


/*
Current Price = 95000

Result = No Change
*/


/*
╔══════════════════════════════════════════════════════════════╗
║                  DATE UPDATE OPERATORS                      ║
╚══════════════════════════════════════════════════════════════╝
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. $currentDate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Store current timestamp.

Think:

"Save current date/time."
*/

db.users.updateOne(
    { name: "John" },
    {
        $currentDate: {
            updatedAt: true
        }
    }
)

/*
Result

updatedAt: ISODate(...)
*/


/*
Real World Uses

✓ updatedAt

✓ lastLogin

✓ lastModified

✓ lastSeen
*/


/*
╔══════════════════════════════════════════════════════════════╗
║                 ARRAY UPDATE OPERATORS                      ║
╚══════════════════════════════════════════════════════════════╝
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9. $push
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Add a value to an array.

Think:

Array.push()
*/

db.users.updateOne(
    { name: "John" },
    {
        $push: {
            skills: "MongoDB"
        }
    }
)

/*
Before

["HTML", "CSS"]

After

["HTML", "CSS", "MongoDB"]
*/


/*
Important:

$push allows duplicates.
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
10. $addToSet
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Add value only if it doesn't already exist.

Think:

Unique push().
*/

db.users.updateOne(
    { name: "John" },
    {
        $addToSet: {
            skills: "MongoDB"
        }
    }
)

/*
If MongoDB already exists:

No change.
*/


/*
Interview Question

Difference between:

$push
$addToSet

$push
→ Allows duplicates

$addToSet
→ Prevents duplicates
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
11. $pull
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Remove matching values.

Think:

Delete specific value from array.
*/

db.users.updateOne(
    { name: "John" },
    {
        $pull: {
            skills: "CSS"
        }
    }
)

/*
Before

["HTML", "CSS", "MongoDB"]

After

["HTML", "MongoDB"]
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
12. $pullAll
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Remove multiple values.

Think:

Delete many values at once.
*/

db.users.updateOne(
    { name: "John" },
    {
        $pullAll: {
            skills: ["HTML", "CSS"]
        }
    }
)


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
13. $pop
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Remove first or last element.

Values:

-1 → First Element
 1 → Last Element
*/

db.users.updateOne(
    { name: "John" },
    {
        $pop: {
            skills: 1
        }
    }
)

/*
Before

["HTML", "CSS", "MongoDB"]

After

["HTML", "CSS"]
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
14. $each
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Insert multiple values.

Used together with $push.
*/

db.users.updateOne(
    { name: "John" },
    {
        $push: {
            skills: {
                $each: [
                    "Node.js",
                    "Express.js",
                    "MongoDB"
                ]
            }
        }
    }
)

/*
Without $each

[
    ["Node.js", "Express.js"]
]

With $each

[
    "Node.js",
    "Express.js"
]
*/


/*
╔══════════════════════════════════════════════════════════════╗
║                  UPDATE MANY EXAMPLE                        ║
╚══════════════════════════════════════════════════════════════╝
*/


/*
Update all inactive users.
*/

db.users.updateMany(
    { isActive: false },
    {
        $set: {
            status: "Inactive"
        }
    }
)


/*
Good reminder:

updateOne()
→ Updates first matching document

updateMany()
→ Updates all matching documents
*/


/*
╔══════════════════════════════════════════════════════════════╗
║                 MOST USED IN REAL PROJECTS                  ║
╚══════════════════════════════════════════════════════════════╝

If I master these operators,
I'll handle most update operations.

✓ $set

✓ $inc

✓ $currentDate

✓ $push

✓ $pull

✓ $addToSet
*/


/*
╔══════════════════════════════════════════════════════════════╗
║                      QUICK REVISION                         ║
╚══════════════════════════════════════════════════════════════╝

FIELD OPERATORS

$set
→ Create / update field

$unset
→ Remove field

$rename
→ Rename field


NUMBER OPERATORS

$inc
→ Add number

$mul
→ Multiply number

$min
→ Keep smaller value

$max
→ Keep larger value


DATE OPERATORS

$currentDate
→ Current timestamp


ARRAY OPERATORS

$push
→ Add to array

$addToSet
→ Add only if unique

$pull
→ Remove matching value

$pullAll
→ Remove multiple values

$pop
→ Remove first/last element

$each
→ Insert multiple values


How I remember them:

$set      → change value
$unset    → delete field
$rename   → rename field

$inc      → +=
$mul      → *=

$min      → smaller wins
$max      → larger wins

$currentDate → timestamp now

$push      → push()
$addToSet  → unique push()
$pull      → remove()
$pullAll   → remove many
$pop       → remove first/last
$each      → bulk insert
*/