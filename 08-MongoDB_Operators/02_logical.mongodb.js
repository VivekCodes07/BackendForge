use("myDb");

/*
╔══════════════════════════════════════════════════════════════╗
║                  MONGODB LOGICAL OPERATORS                  ║
╚══════════════════════════════════════════════════════════════╝

Logical operators are used when a single condition is not enough.

Think:

$and -> ALL conditions must match
$or  -> ANY condition can match
$not -> Opposite of a condition
$nor -> None of the conditions should match
*/

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. $and
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Use when ALL conditions must be true.

Note:
Most of the time MongoDB applies AND automatically,
so explicit $and is not always needed.
*/

db.users.find(
  {
    $and: [{ isActive: true }, { age: { $gt: 25 } }],
  },
  {
    _id: 0,
    name: 1,
    age: 1,
    isActive: 1,
    role: 1,
  },
);

/*
Same query without $and:

{
    isActive: true,
    age: { $gt: 25 }
}

MongoDB treats multiple conditions as AND.
*/

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. $or
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Use when ANY condition can be true.

Returns:
- Smartphones
OR
- Products costing more than 79,999
*/

db.products.find(
  {
    $or: [{ category: "Smartphone" }, { price: { $gt: 79999 } }],
  },
  {
    _id: 0,
    name: 1,
    category: 1,
    price: 1,
  },
);

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. $not
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Negates a condition.

Important:
$not is used WITH another operator.

Pattern:

{
    field: {
        $not: { operator }
    }
}

Read it as:

"Give me documents that DO NOT satisfy
this condition."
*/

db.products.find(
  {
    price: {
      $not: {
        $gt: 50000,
      },
    },
  },
  {
    _id: 0,
    name: 1,
    price: 1,
  },
);

/*
How I read this query:

NOT(price > 50000)

which means:

price <= 50000
*/

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. $nor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
Opposite of $or.

$or:
At least one condition should match.

$nor:
None of the conditions should match.

*/

db.products.find(
  {
    $nor: [{ category: "Smartphone" }, { price: { $gt: 79999 } }],
  },
  {
    _id: 0,
    name: 1,
    category: 1,
    price: 1,
  },
);

/*
Returns products that are:

NOT Smartphone
AND
NOT above 79,999
*/

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. Combining Logical Operators
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Very common interview pattern.

Find active users whose:

age > 30
OR
role = "Admin"

SQL Equivalent:

WHERE isActive = true
AND (
    age > 30
    OR role = 'Admin'
)
*/

db.users.find(
  {
    $and: [
      { isActive: true },
      {
        $or: [{ age: { $gt: 30 } }, { role: "Admin" }],
      },
    ],
  },
  {
    _id: 0,
    name: 1,
    age: 1,
    role: 1,
    isActive: 1,
  },
);

/*
╔══════════════════════════════════════════════════════════════╗
║                      QUICK REVISION                         ║
╚══════════════════════════════════════════════════════════════╝

$and
→ All conditions must match

$or
→ Any one condition can match

$not
→ Reverse a condition

$nor
→ None of the conditions should match


How I remember them:

$and -> stricter search
$or  -> broader search
$not -> opposite
$nor -> reject everything listed


Most Common Interview Pattern:

{
    $and: [
        { status: "Active" },
        {
            $or: [
                { role: "Admin" },
                { role: "Manager" }
            ]
        }
    ]
}
*/
