use("myDb");

/*
╔══════════════════════════════════════════════════════════════╗
║                MONGODB EVALUATION OPERATORS                 ║
╚══════════════════════════════════════════════════════════════╝

Evaluation operators are used when MongoDB needs to
evaluate a condition instead of doing a simple comparison.

Operators covered:

$regex
$expr
$mod

Useful for:

- Pattern matching
- Comparing fields within the same document
- Performing calculations in queries
*/

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. $regex
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Match string values using a regular expression.

Think:
Search text by pattern instead of exact value.

Useful for:

- Search
- Starts with
- Ends with
- Contains
*/

/*
Find users whose name starts with "A"

^ means "starts with"
*/

db.users.find(
  {
    name: {
      $regex: /^A/,
    },
  },
  {
    _id: 0,
    name: 1,
  },
);

/*
Find users whose email ends with gmail.com

$ means "ends with"
*/

db.users.find(
  {
    email: {
      $regex: /gmail\.com$/,
    },
  },
  {
    _id: 0,
    name: 1,
    email: 1,
  },
);

/*
Find products containing "pro" in their name.

i = case insensitive
*/

db.products.find(
  {
    name: {
      $regex: /pro/i,
    },
  },
  {
    _id: 0,
    name: 1,
  },
);

/*
Quick Regex Notes

^A          -> Starts with A
A$          -> Ends with A
/pro/i      -> Case insensitive
.           -> Any character
*/

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. $expr
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Allows aggregation expressions inside queries.

Think:

Instead of comparing a field to a fixed value,
compare fields with each other.

Very useful when values depend on other fields.
*/

/*
Find products where stock is greater than minimumStock.

Meaning:

stock > minimumStock
*/

db.products.find(
  {
    $expr: {
      $gt: ["$stock", "$minimumStock"],
    },
  },
  {
    _id: 0,
    name: 1,
    stock: 1,
    minimumStock: 1,
  },
);

/*
Find products where price is greater than discountPrice.

Meaning:

price > discountPrice
*/

db.products.find(
  {
    $expr: {
      $gt: ["$price", "$discountPrice"],
    },
  },
  {
    _id: 0,
    name: 1,
    price: 1,
    discountPrice: 1,
  },
);

/*
How I read this:

$expr lets me compare:

field vs field

instead of:

field vs fixed value
*/

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. $mod
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Performs modulo operation.

Syntax:

{
    field: {
        $mod: [divisor, remainder]
    }
}

Useful when checking:

- Even numbers
- Odd numbers
- Every nth record
*/

/*
Find users whose age is even.

age % 2 = 0
*/

db.users.find(
  {
    age: {
      $mod: [2, 0],
    },
  },
  {
    _id: 0,
    name: 1,
    age: 1,
  },
);

/*
Find users whose age is odd.

age % 2 = 1
*/

db.users.find(
  {
    age: {
      $mod: [2, 1],
    },
  },
  {
    _id: 0,
    name: 1,
    age: 1,
  },
);

/*
Find products where price is divisible by 1000.

price % 1000 = 0
*/

db.products.find(
  {
    price: {
      $mod: [1000, 0],
    },
  },
  {
    _id: 0,
    name: 1,
    price: 1,
  },
);

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. Combining Evaluation Operators
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Find users whose:

- email contains gmail
AND
- age is even
*/

db.users.find(
  {
    email: {
      $regex: /gmail/i,
    },
    age: {
      $mod: [2, 0],
    },
  },
  {
    _id: 0,
    name: 1,
    email: 1,
    age: 1,
  },
);

/*
Why would I use evaluation operators?

Because sometimes simple operators like:

$eq
$gt
$lt

are not enough.

Examples:

✓ Search text patterns

✓ Compare one field with another

✓ Check mathematical conditions

✓ Validate business rules
*/

/*
╔══════════════════════════════════════════════════════════════╗
║                      QUICK REVISION                         ║
╚══════════════════════════════════════════════════════════════╝

$regex
→ Pattern matching

Examples:

/^A/       -> Starts with A
/A$/       -> Ends with A
/pro/i     -> Contains "pro" (case insensitive)


$expr
→ Compare fields or use expressions

Example:

{
    $expr: {
        $gt: ["$price", "$discountPrice"]
    }
}


$mod
→ Modulo operation

Examples:

[2, 0] -> Even numbers

[2, 1] -> Odd numbers


How I remember them:

$regex
→ Search by pattern

$expr
→ Compare fields

$mod
→ Check divisibility


Most Common Interview Questions:

Find users whose name starts with A

{
    name: {
        $regex: /^A/
    }
}


Find products where stock exceeds minimumStock

{
    $expr: {
        $gt: ["$stock", "$minimumStock"]
    }
}


Find even ages

{
    age: {
        $mod: [2, 0]
    }
}
*/
