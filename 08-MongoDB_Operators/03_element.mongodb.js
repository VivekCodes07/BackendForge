use("myDb");

/*
╔══════════════════════════════════════════════════════════════╗
║                  MONGODB ELEMENT OPERATORS                  ║
╚══════════════════════════════════════════════════════════════╝

Element operators are used to check:

- Whether a field exists
- What data type a field contains

Operators covered:

$exists
$type

Useful when working with optional fields or
documents that don't always follow the same structure.
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. $exists
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Checks whether a field exists in a document.

Syntax:

{
    field: {
        $exists: true
    }
}

Returns documents that contain the field,
even if the value is null.
*/

db.users.find(
    {
        phoneNumber: {
            $exists: true
        }
    },
    {
        _id: 0,
        name: 1,
        phoneNumber: 1
    }
)


/*
Find users who DO NOT have a phoneNumber field.

Useful when looking for incomplete profiles.
*/

db.users.find(
    {
        phoneNumber: {
            $exists: false
        }
    },
    {
        _id: 0,
        name: 1
    }
)


/*
Important:

$exists checks for field presence,
NOT whether the field contains a value.

Example document:

{
    name: "John",
    phoneNumber: null
}

This document matches:

{
    phoneNumber: {
        $exists: true
    }
}
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. $type
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Checks the BSON type of a field.

Useful when data is inconsistent and
you want documents containing a specific type.
*/

db.users.find(
    {
        age: {
            $type: "int"
        }
    },
    {
        _id: 0,
        name: 1,
        age: 1
    }
)


/*
Find users whose email field is stored as a string.
*/

db.users.find(
    {
        email: {
            $type: "string"
        }
    },
    {
        _id: 0,
        name: 1,
        email: 1
    }
)


/*
Find products where tags are stored as an array.
*/

db.products.find(
    {
        tags: {
            $type: "array"
        }
    },
    {
        _id: 0,
        name: 1,
        tags: 1
    }
)


/*
Common BSON Types

string      -> Text values
int         -> Integer numbers
double      -> Decimal numbers
bool        -> true / false
array       -> Arrays
object      -> Embedded documents
date        -> Date values
null        -> Null values
objectId    -> MongoDB IDs
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. Combining Element Operators
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Find users whose email field:

- Exists
AND
- Is a string
*/

db.users.find(
    {
        email: {
            $exists: true,
            $type: "string"
        }
    },
    {
        _id: 0,
        name: 1,
        email: 1
    }
)


/*
Why would I use this?

Imagine bad data like:

{
    email: 12345
}

The field exists,
but it's not the correct type.

Combining $exists and $type helps validate data.
*/


/*
╔══════════════════════════════════════════════════════════════╗
║                      QUICK REVISION                         ║
╚══════════════════════════════════════════════════════════════╝

$exists
→ Checks whether a field is present

true
→ Field must exist

false
→ Field must not exist


$type
→ Checks the BSON data type of a field

Examples:

{
    age: {
        $type: "int"
    }
}

{
    email: {
        $type: "string"
    }
}


How I remember them:

$exists
→ "Does this field exist?"

$type
→ "What type of data is stored here?"


Common use cases:

✓ Find missing fields

✓ Validate data structure

✓ Clean inconsistent data

✓ Verify imported datasets
*/