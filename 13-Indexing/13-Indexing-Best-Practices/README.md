# Indexing Best Practices

## Why Am I Learning This?

At this point, I've learned almost every major type of index MongoDB provides.

I've worked with:

* Single Field Indexes
* Compound Indexes
* Unique Indexes
* Multikey Indexes
* Text Indexes
* Covered Queries
* TTL Indexes
* Explain Plans

When I started learning indexes, my mindset was:

```text
Indexes make queries faster.
```

Which is true.

But after finishing the indexing section, I've realized something important:

> Creating indexes is easy.
>
> Creating the right indexes is the hard part.

This lesson is about learning how experienced backend engineers think before creating indexes.

---

# The Biggest Beginner Mistake

After learning indexes, it's very tempting to think:

```text
Indexes improve performance.
↓
Let's add indexes everywhere.
```

For example:

```javascript
db.users.createIndex({ username: 1 })

db.users.createIndex({ email: 1 })

db.users.createIndex({ age: 1 })

db.users.createIndex({ country: 1 })

db.users.createIndex({ city: 1 })

db.users.createIndex({ gender: 1 })

db.users.createIndex({ bio: 1 })
```

At first glance this feels smart.

More indexes should mean more speed.

Right?

Not exactly.

---

# The Hidden Cost Of Indexes

Indexes are not free.

Every index requires:

```text
Extra Storage
Extra Memory
Extra Maintenance
```

Imagine this collection:

```javascript
db.users.insertOne({
    username: "vivek",
    email: "vivek@gmail.com",
    age: 24,
    country: "India"
})
```

Now suppose I have:

```javascript
{ username: 1 }
{ email: 1 }
{ age: 1 }
{ country: 1 }
```

When MongoDB inserts this document:

It must update:

```text
User Document
+
Username Index
+
Email Index
+
Age Index
+
Country Index
```

The more indexes I create:

```text
Faster Reads
↓
But
↓
Slower Writes
```

This is the tradeoff.

---

# My First Rule

## Index Fields That Are Actually Queried

Bad:

```javascript
db.users.createIndex({
    favoriteColor: 1
})
```

If nobody searches by favorite color, this index is useless.

---

Good:

```javascript
db.users.find({
    email: "vivek@gmail.com"
})
```

Create:

```javascript
db.users.createIndex({
    email: 1
})
```

Because the index directly supports a real query.

---

# Think Like A Backend Engineer

Before creating an index, I should ask:

```text
Do I actually query this field frequently?
```

If the answer is:

```text
No
```

Then I probably don't need an index.

---

# Rule #2

## Measure Before Adding Indexes

Never create indexes blindly.

Instead:

```javascript
db.users.find({
    email: "vivek@gmail.com"
}).explain("executionStats")
```

Look at:

```text
COLLSCAN
```

and

```text
totalDocsExamined
```

Example:

```javascript
{
    totalDocsExamined: 100000
}
```

That's a sign that an index might help.

---

Now create:

```javascript
db.users.createIndex({
    email: 1
})
```

Run explain again:

```javascript
db.users.find({
    email: "vivek@gmail.com"
}).explain("executionStats")
```

Now maybe:

```javascript
{
    totalDocsExamined: 1
}
```

That's evidence.

Not guessing.

---

# Rule #3

## Use Compound Indexes Carefully

Imagine an e-commerce application.

Query:

```javascript
db.orders.find({
    customerId: ObjectId("685c9a41c6f4f56e2a1b101"),
    status: "Delivered"
})
```

Create:

```javascript
db.orders.createIndex({
    customerId: 1,
    status: 1
})
```

Good.

Because it matches the query pattern.

---

Now imagine:

```javascript
db.orders.createIndex({
    status: 1,
    customerId: 1
})
```

Will it work?

Sometimes.

Will it always be optimal?

Not necessarily.

Field order matters.

This is why understanding query patterns is important.

---

# Rule #4

## Don't Create Duplicate Indexes

Bad:

```javascript
db.users.createIndex({
    email: 1
})

db.users.createIndex({
    email: 1
})
```

Completely unnecessary.

Always check existing indexes first.

```javascript
db.users.getIndexes()
```

---

# Rule #5

## Prefer Covered Queries When Possible

One of the fastest query patterns I've learned.

Index:

```javascript
db.users.createIndex({
    username: 1,
    email: 1
})
```

Query:

```javascript
db.users.find(
    {
        username: "vivek"
    },
    {
        email: 1,
        _id: 0
    }
).explain("executionStats")
```

Output:

```javascript
{
    totalDocsExamined: 0
}
```

MongoDB never touched the actual document.

It answered directly from the index.

That's incredibly efficient.

---

# Rule #6

## Use Unique Indexes For Data Integrity

Example:

```javascript
db.users.createIndex(
    {
        email: 1
    },
    {
        unique: true
    }
)
```

Now MongoDB guarantees:

```text
One email
=
One account
```

This isn't just performance.

It's data protection.

---

# Rule #7

## Use TTL Indexes Only For Temporary Data

Good examples:

```text
OTPs
Sessions
Verification Tokens
Password Reset Tokens
Cache Data
```

Example:

```javascript
db.sessions.createIndex(
    {
        createdAt: 1
    },
    {
        expireAfterSeconds: 86400
    }
)
```

---

Bad examples:

```text
Users
Orders
Products
Payments
Transactions
```

Imagine customer orders disappearing automatically 😂

Not good.

---

# Rule #8

## Remove Unused Indexes

Over time projects evolve.

Sometimes indexes become unnecessary.

View indexes:

```javascript
db.users.getIndexes()
```

Example:

```javascript
[
    { username: 1 },
    { email: 1 },
    { age: 1 }
]
```

Suppose age is never queried anymore.

Remove:

```javascript
db.users.dropIndex({
    age: 1
})
```

Keeping unnecessary indexes wastes resources.

---

# Rule #9

## Always Verify With Explain

Creating an index doesn't guarantee MongoDB will use it.

Verify:

```javascript
db.users.find({
    email: "vivek@gmail.com"
}).explain("executionStats")
```

Look for:

```text
IXSCAN
```

Good.

---

Look for:

```text
COLLSCAN
```

Bad.

---

Look for:

```javascript
totalDocsExamined
```

Lower is better.

---

Look for:

```javascript
totalKeysExamined
```

Lower is better.

---

# Real World Example

Imagine Udemy stores courses.

Document:

```javascript
db.courses.insertOne({
    title: "MongoDB Mastery",
    instructor: "Vivek",
    category: "Database",
    price: 4999,
    rating: 4.9
})
```

Users frequently search:

```javascript
db.courses.find({
    category: "Database"
})
```

and

```javascript
db.courses.find({
    instructor: "Vivek"
})
```

Good indexes:

```javascript
db.courses.createIndex({
    category: 1
})

db.courses.createIndex({
    instructor: 1
})
```

Because they support real application behavior.

Not hypothetical queries.

---

# My Indexing Checklist

Whenever I'm thinking about creating an index, I ask:

### Question 1

```text
Is this field queried frequently?
```

If no:

```text
Don't create the index.
```

---

### Question 2

```text
Can explain() prove I need it?
```

If yes:

```text
Create it.
```

---

### Question 3

```text
Will this improve reads enough to justify slower writes?
```

Think about the tradeoff.

---

### Question 4

```text
Can I build a compound index instead of multiple separate indexes?
```

Often that's the better solution.

---

### Question 5

```text
Am I creating this index because I need it,
or because I think more indexes always help?
```

Important distinction.

---

# My Final Mental Model

When I started learning MongoDB indexes, I thought:

```text
Indexes = Speed
```

Now my understanding is:

```text
Indexes are tools.

Good indexes improve performance.

Bad indexes waste resources.
```

A great MongoDB developer doesn't ask:

```text
How many indexes can I create?
```

They ask:

```text
Which indexes provide the most value?
```

That's the real goal.

---

# Quick Revision

Good practices:

✅ Index frequently queried fields

✅ Use explain()

✅ Monitor COLLSCAN

✅ Use compound indexes wisely

✅ Use unique indexes when needed

✅ Use TTL for temporary data

✅ Remove unused indexes

---

Avoid:

❌ Indexing everything

❌ Creating duplicate indexes

❌ Ignoring write performance

❌ Assuming MongoDB always uses your index

❌ Creating indexes without measuring

---

## Most Important Thing I Learned

> Indexes are not about creating as many as possible.

They're about creating the right ones.

A carefully chosen index can make queries dramatically faster.

A poorly chosen index can waste storage, slow writes, and provide little benefit.

The goal is not more indexes.

The goal is better indexes.
