use('ecommerce')

/*
╔══════════════════════════════════════════════════════════════╗
║              MONGODB COMPARISON OPERATORS                   ║
╚══════════════════════════════════════════════════════════════╝

Comparison operators are used to compare field values and
filter documents that match a specific condition.

General Syntax:

{
    fieldName: {
        operator: value
    }
}

Example:

{
    price: {
        $gt: 100
    }
}

Meaning:
Return all documents where price is greater than 100.
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. $gt (Greater Than)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Find documents where a field value is greater than a given value.

Syntax:
{
    field: { $gt: value }
}

SQL Equivalent:
WHERE field > value
*/

db.products.find(
    { price: { $gt: 160 } },
    { _id: 0, name: 1, category: 1, price: 1 }
)


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. $gte (Greater Than or Equal To)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Find documents where a field value is greater than or equal
to a given value.

SQL Equivalent:
WHERE field >= value
*/

db.products.find(
    { price: { $gte: 160 } },
    { _id: 0, name: 1, category: 1, price: 1 }
)


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. $lt (Less Than)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Find documents where a field value is less than a given value.

SQL Equivalent:
WHERE field < value
*/

db.products.find(
    { price: { $lt: 348 } },
    { _id: 0, name: 1, category: 1, price: 1 }
)


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. $lte (Less Than or Equal To)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Find documents where a field value is less than or equal
to a given value.

SQL Equivalent:
WHERE field <= value
*/

db.products.find(
    { price: { $lte: 348 } },
    { _id: 0, name: 1, category: 1, price: 1 }
)


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. $eq (Equal To)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Find documents where a field value exactly matches.

SQL Equivalent:
WHERE field = value

Note:
MongoDB allows shorthand syntax:

{ price: 299 }

instead of:

{ price: { $eq: 299 } }
*/

db.products.find(
    { price: { $eq: 299 } },
    { _id: 0, name: 1, category: 1, price: 1 }
)


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. $ne (Not Equal To)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Find documents where a field value is NOT equal to
a given value.

SQL Equivalent:
WHERE field != value
*/

db.products.find(
    { price: { $ne: 299 } },
    { _id: 0, name: 1, category: 1, price: 1 }
)


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. Multiple Comparison Operators
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Use multiple comparison operators on the same field.

Example:
Find products priced between 200 and 500.

SQL Equivalent:

WHERE price > 200
AND price < 500
*/

db.products.find(
    {
        price: {
            $gt: 200,
            $lt: 500
        }
    },
    { _id: 0, name: 1, category: 1, price: 1 }
)


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. $in
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Match any value from a specified list.

SQL Equivalent:

WHERE category IN (...)
*/

db.products.find(
    {
        category: {
            $in: ['Electronics', 'Fashion']
        }
    },
    { _id: 0, name: 1, category: 1, price: 1 }
)


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9. $nin (Not In)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Exclude values present in a specified list.

SQL Equivalent:

WHERE category NOT IN (...)
*/

db.products.find(
    {
        category: {
            $nin: ['Electronics', 'Fashion']
        }
    },
    { _id: 0, name: 1, category: 1, price: 1 }
)


/*
╔══════════════════════════════════════════════════════════════╗
║                      QUICK REVISION                         ║
╚══════════════════════════════════════════════════════════════╝

$gt    → Greater Than                  >
$gte   → Greater Than or Equal To      >=

$lt    → Less Than                     <
$lte   → Less Than or Equal To         <=

$eq    → Equal To                      =
$ne    → Not Equal To                  !=

$in    → Value exists in array
$nin   → Value does not exist in array


Most Common Interview Question:

Find products with price between 100 and 500

{
    price: {
        $gte: 100,
        $lte: 500
    }
}

Remember:

$gt  → strict comparison
$gte → inclusive comparison

$lt  → strict comparison
$lte → inclusive comparison
*/