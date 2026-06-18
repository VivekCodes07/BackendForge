use("myDb");

/*
╔══════════════════════════════════════════════════════════════╗
║                   MONGODB ARRAY OPERATORS                   ║
╚══════════════════════════════════════════════════════════════╝

Array operators are used when working with array fields.

Operators covered:

$all
$elemMatch
$size

Useful for:

- Finding documents containing specific values
- Matching elements inside arrays
- Checking array length

Example document:

{
    name: "iPhone 15",
    tags: ["smartphone", "apple", "premium"],
    reviews: [
        { rating: 5, verified: true },
        { rating: 4, verified: false }
    ]
}
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. $all
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Match documents whose array contains ALL specified values.

Think:

Array must contain every value listed.

SQL doesn't have a direct equivalent,
but think of it as multiple AND conditions.
*/


/*
Find products that contain BOTH
"smartphone" and "premium" tags.
*/

db.products.find(
    {
        tags: {
            $all: ["smartphone", "premium"]
        }
    },
    {
        _id: 0,
        name: 1,
        tags: 1
    }
)


/*
This matches:

["smartphone", "premium", "apple"]

This does NOT match:

["smartphone", "apple"]
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. $elemMatch
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Match documents where at least one array element
satisfies multiple conditions.

Most useful when working with arrays of objects.
*/


/*
Example document:

{
    reviews: [
        { rating: 5, verified: true },
        { rating: 2, verified: false }
    ]
}
*/


/*
Find products having at least one review where:

rating >= 4
AND
verified = true
*/

db.products.find(
    {
        reviews: {
            $elemMatch: {
                rating: { $gte: 4 },
                verified: true
            }
        }
    },
    {
        _id: 0,
        name: 1,
        reviews: 1
    }
)


/*
How I read this query:

Give me products where at least one review
matches ALL these conditions.
*/


/*
Without $elemMatch, MongoDB may match
conditions from different array elements.

Use $elemMatch when multiple conditions
must be true for the SAME element.
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. $size
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Match arrays having an exact number of elements.

Think:

Array length check.
*/


/*
Find products with exactly 3 tags.
*/

db.products.find(
    {
        tags: {
            $size: 3
        }
    },
    {
        _id: 0,
        name: 1,
        tags: 1
    }
)


/*
Find users having exactly 2 addresses.
*/

db.users.find(
    {
        addresses: {
            $size: 2
        }
    },
    {
        _id: 0,
        name: 1,
        addresses: 1
    }
)


/*
Important:

$size only checks exact length.

Works:

$size: 3

Does NOT work:

$size: { $gt: 3 }

For greater than / less than checks,
- use $expr with aggregation operators.
*/


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. Combining Array Operators
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Find products that:

- Have both "smartphone" and "premium" tags
- Have exactly 3 tags
*/

db.products.find(
    {
        tags: {
            $all: ["smartphone", "premium"],
            $size: 3
        }
    },
    {
        _id: 0,
        name: 1,
        tags: 1
    }
)


/*
Another practical example:

Find products with at least one verified
5-star review.
*/

db.products.find(
    {
        reviews: {
            $elemMatch: {
                rating: 5,
                verified: true
            }
        }
    },
    {
        _id: 0,
        name: 1,
        reviews: 1
    }
)


/*
Why would I use array operators?

Because many MongoDB documents contain arrays.

Examples:

✓ Product tags

✓ User skills

✓ Reviews

✓ Categories

✓ Order items

✓ Addresses
*/


/*
╔══════════════════════════════════════════════════════════════╗
║                      QUICK REVISION                         ║
╚══════════════════════════════════════════════════════════════╝

$all
→ Array must contain ALL specified values

Example:

{
    tags: {
        $all: ["smartphone", "premium"]
    }
}


$elemMatch
→ At least one array element must satisfy
  all conditions

Example:

{
    reviews: {
        $elemMatch: {
            rating: 5,
            verified: true
        }
    }
}


$size
→ Array length must match exactly

Example:

{
    tags: {
        $size: 3
    }
}


How I remember them:

$all
→ Contains everything listed

$elemMatch
→ One element matches all conditions

$size
→ Array length checker


Most Common Interview Question:

Difference between:

$all
and
$elemMatch

$all
→ Works with array values

$elemMatch
→ Works with conditions on the same array element


Example:

tags: ["smartphone", "premium"]

→ Use $all


reviews: [
    { rating: 5, verified: true }
]

→ Use $elemMatch
*/