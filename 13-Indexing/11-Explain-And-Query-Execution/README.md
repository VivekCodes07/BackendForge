# Explain & Query Execution

## Why Am I Learning This?

So far in my indexing journey, I've learned how to create indexes.

I've created:

* Single Field Indexes
* Compound Indexes
* Unique Indexes
* Multikey Indexes
* Text Indexes
* TTL Indexes

And every time I created an index, I assumed:

```text
MongoDB will use it.
```

But then a question hit me:

> How do I actually know MongoDB is using my index?

Just because an index exists doesn't mean MongoDB is using it.

And just because a query works doesn't mean it's efficient.

For example:

```javascript
db.users.find({
    username: "vivek"
})
```

This query might:

```text
Use an Index
```

or

```text
Scan Every Document
```

The result is the same.

The performance is completely different.

As a backend engineer, I don't care only about correctness.

I care about:

```text
How MongoDB executed the query.
```

That's exactly why `.explain()` exists.

---

# The Problem

Imagine I have:

```javascript
db.users.insertMany([
    {
        username: "vivek",
        email: "vivek@gmail.com",
        age: 24
    },
    {
        username: "alex",
        email: "alex@gmail.com",
        age: 29
    },
    {
        username: "emma",
        email: "emma@gmail.com",
        age: 27
    }
])
```

Now I run:

```javascript
db.users.find({
    username: "vivek"
})
```

MongoDB returns:

```javascript
{
    username: "vivek",
    email: "vivek@gmail.com",
    age: 24
}
```

Looks fine.

But what happened internally?

Did MongoDB:

```text
Use an index?
```

or

```text
Scan every document?
```

I can't tell by looking at the result.

That's where `.explain()` helps.

---

# What Is .explain()?

`.explain()` tells MongoDB:

```text
Don't just execute the query.

Show me HOW you executed it.
```

Think of it as:

```text
Query Report Card
```

Instead of showing only the result:

```text
What happened
```

MongoDB shows:

```text
How it happened
```

---

# My First Explain

Normal query:

```javascript
db.users.find({
    username: "vivek"
})
```

Explain version:

```javascript
db.users.find({
    username: "vivek"
}).explain("executionStats")
```

Now MongoDB returns detailed execution information.

Instead of data, I get a report.

---

# Real Life Analogy

Imagine ordering food.

Without explain:

```text
Food arrives.
```

That's all you know.

With explain:

```text
Restaurant accepted order
↓
Chef prepared food
↓
Delivery partner picked it up
↓
Delivered
```

You can now see the entire journey.

`.explain()` does the same for queries.

---

# The Most Important Field

When reading explain output, the first thing I look for is:

```text
winningPlan
```

This tells me:

```text
Which execution strategy MongoDB chose.
```

Think:

```text
MongoDB considered options
↓
Picked the best one
↓
winningPlan
```

---

# COLLSCAN

One of the most important terms in MongoDB.

You will see:

```text
COLLSCAN
```

which means:

```text
Collection Scan
```

MongoDB is literally scanning every document.

Example:

```javascript
db.users.find({
    username: "vivek"
}).explain("executionStats")
```

Output may contain:

```text
COLLSCAN
```

MongoDB's thought process:

```text
I don't have a useful index.

I'll look through everything.
```

---

# Visualizing COLLSCAN

Imagine:

```text
1
2
3
4
5
6
7
8
9
10
```

Searching for:

```text
7
```

Without an index:

```text
Check 1
Check 2
Check 3
Check 4
Check 5
Check 6
Check 7
Found
```

This is COLLSCAN.

Works.

But scales terribly.

---

# IXSCAN

Now let's create an index.

```javascript
db.users.createIndex({
    username: 1
})
```

Run:

```javascript
db.users.find({
    username: "vivek"
}).explain("executionStats")
```

Now you'll likely see:

```text
IXSCAN
```

which means:

```text
Index Scan
```

MongoDB is using the index.

This is exactly what we want.

---

# Visualizing IXSCAN

Without index:

```text
Check every document.
```

With index:

```text
Go directly to the correct location.
```

MongoDB's thought process:

```text
I already know where username = vivek exists.

Why scan everything?
```

---

# The Golden Numbers

These are the most important fields you'll learn today.

---

## totalDocsExamined

Example:

```javascript
totalDocsExamined: 10000
```

Meaning:

```text
MongoDB examined 10,000 documents.
```

That's expensive.

---

Example:

```javascript
totalDocsExamined: 1
```

Much better.

---

Example:

```javascript
totalDocsExamined: 0
```

Amazing.

Usually indicates a Covered Query.

---

# totalKeysExamined

Example:

```javascript
totalKeysExamined: 1
```

Meaning:

```text
MongoDB examined 1 index entry.
```

This is usually very efficient.

---

# Reading Both Together

Example:

```javascript
totalKeysExamined: 1
totalDocsExamined: 1
```

MongoDB:

```text
Used index
↓
Found document
↓
Fetched document
```

Very good.

---

Example:

```javascript
totalKeysExamined: 1
totalDocsExamined: 0
```

MongoDB:

```text
Used index
↓
Never fetched document
```

Covered Query.

Excellent.

---

Example:

```javascript
totalKeysExamined: 0
totalDocsExamined: 10000
```

MongoDB:

```text
No index
↓
Scanned everything
```

Bad.

---

# Real Example

Collection:

```javascript
db.users.insertMany([
    {
        username: "vivek",
        email: "vivek@gmail.com"
    },
    {
        username: "alex",
        email: "alex@gmail.com"
    }
])
```

Create index:

```javascript
db.users.createIndex({
    username: 1
})
```

Run:

```javascript
db.users.find({
    username: "vivek"
}).explain("executionStats")
```

Potential output:

```javascript
{
    totalKeysExamined: 1,
    totalDocsExamined: 1
}
```

MongoDB used the index successfully.

---

# Covered Query Example

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
    totalKeysExamined: 1,
    totalDocsExamined: 0
}
```

Beautiful.

MongoDB never touched the document.

---

# executionTimeMillis

Another useful metric:

```javascript
executionTimeMillis
```

Example:

```javascript
executionTimeMillis: 1
```

Meaning:

```text
Query took 1 millisecond.
```

Smaller is usually better.

---

# What I Actually Check First

Whenever I run explain, I follow this order:

### Step 1

Look for:

```text
COLLSCAN
```

If I see it:

```text
Something is wrong.
```

---

### Step 2

Look for:

```text
IXSCAN
```

If I see it:

```text
MongoDB is using an index.
```

---

### Step 3

Check:

```javascript
totalDocsExamined
```

Lower is better.

---

### Step 4

Check:

```javascript
totalKeysExamined
```

Lower is usually better.

---

### Step 5

Check:

```javascript
executionTimeMillis
```

Good for comparison.

---

# Common Beginner Mistakes

## Mistake #1

Creating indexes and assuming they're being used.

Always verify.

---

## Mistake #2

Looking only at query results.

Query results tell me:

```text
What happened
```

Explain tells me:

```text
How it happened
```

---

## Mistake #3

Ignoring COLLSCAN.

COLLSCAN is one of the biggest performance warning signs in MongoDB.

---

# My Mental Model

Whenever I run:

```javascript
db.users.find({
    username: "vivek"
}).explain("executionStats")
```

I imagine I'm asking MongoDB:

```text
I know you found the data.

Now show me your work.
```

And MongoDB replies:

```text
Here's exactly how I found it.

Here's how many documents I checked.

Here's how many index entries I used.

Here's how long it took.
```

That's exactly what explain gives me.

---

# Quick Revision

Most important command:

```javascript
.explain("executionStats")
```

Look for:

```text
IXSCAN
```

Good ✅

---

Look for:

```text
COLLSCAN
```

Bad ❌

---

Important metrics:

```javascript
totalDocsExamined
```

Lower is better.

---

```javascript
totalKeysExamined
```

Lower is better.

---

```javascript
executionTimeMillis
```

Measures execution time.

---

Most important thing I learned:

> Creating an index is not enough.

A good MongoDB developer verifies that MongoDB is actually using the index.

`.explain()` is the tool that turns guesswork into evidence.
