# MongoDB Sharding — Lesson 3

## Shard Keys

Now I know the architecture of a MongoDB Sharded Cluster.

I know that:

```text
Application
     ↓
   mongos
     ↓
  Shards
```

But I still have one big question:

> **How does `mongos` know which shard contains the data I am looking for?**

The answer starts with the **Shard Key**.

---

# 1. The Problem

Imagine I have:

```text
1,000,000 users
```

and:

```text
Shard 1
Shard 2
Shard 3
```

My documents might look like:

```javascript
{
    userId: 8472,
    name: "Vivek",
    age: 20
}
```

Now I send:

```javascript
db.users.findOne({
    userId: 8472
})
```

MongoDB needs to figure out:

```text
"Which shard should I ask?"
```

It shouldn't blindly ask:

```text
Shard 1 → Do you have 8472?

Shard 2 → Do you have 8472?

Shard 3 → Do you have 8472?
```

if it can determine the relevant shard more precisely.

This is where the shard key becomes important.

---

# 2. What Is A Shard Key?

A **shard key** is a field or set of fields from my documents that MongoDB uses to distribute data across shards and route operations.

For example:

```text
userId
```

could be my shard key.

So:

```text
Document
   │
   ▼
userId
   │
   ▼
Shard Key
   │
   ├──────────────┐
   ▼              ▼
Distribution    Routing
```

This gives me two important responsibilities:

```text
Shard Key
   │
   ├── Helps distribute data
   │
   └── Helps route queries
```

---

# 3. The Query Routing Flow

This is the part I really want to understand.

Suppose:

```text
Shard Key = userId
```

and my application sends:

```javascript
db.users.findOne({
    userId: 8472
})
```

Now let's follow the request **step by step**.

---

## Step 1 — Application Sends The Query

My application sends:

```javascript
db.users.findOne({
    userId: 8472
})
```

to `mongos`.

```text
Application
     │
     │ userId = 8472
     ▼
   mongos
```

My application doesn't need to know:

```text
"User 8472 is on Shard 2."
```

That's MongoDB's job.

---

## Step 2 — `mongos` Examines The Query

`mongos` receives:

```text
userId = 8472
```

It knows that:

```text
userId
```

is part of the shard key.

So this query contains useful shard-key information.

```text
Query
 │
 └── userId = 8472
          │
          ▼
     Shard Key
```

---

## Step 3 — `mongos` Uses Sharding Metadata

`mongos` needs to know how the shard-key space is currently distributed.

The Config Servers maintain the cluster's sharding metadata.

Conceptually:

```text
             Config Servers
                   │
                   │ Metadata
                   ▼
                 mongos
```

That metadata tells `mongos` how shard-key ranges/chunks are mapped to shards.

For example, conceptually:

```text
Shard-key space

Range A ─────────→ Shard 1

Range B ─────────→ Shard 2

Range C ─────────→ Shard 3
```

If:

```text
userId = 8472
```

falls into Range B:

```text
8472
  │
  ▼
Range B
  │
  ▼
Shard 2
```

Now `mongos` knows where the query should go.

---

## Step 4 — `mongos` Targets The Relevant Shard

Now the flow becomes:

```text
mongos
   │
   │ userId = 8472
   ▼
Shard 2
```

Instead of:

```text
mongos
   │
   ├──► Shard 1
   ├──► Shard 2
   └──► Shard 3
```

That's the benefit of having useful shard-key information.

---

## Step 5 — The Shard Executes The Query

The query reaches the relevant shard.

If that shard is backed by a Replica Set:

```text
                   Shard 2
                      │
                Replica Set
                      │
             ┌────────┼────────┐
             ▼        ▼        ▼
          Primary  Secondary Secondary
```

The operation is handled according to MongoDB's read/write rules and configuration.

The relevant document is found.

For example:

```javascript
{
    userId: 8472,
    name: "Vivek",
    age: 20
}
```

---

## Step 6 — Result Returns To `mongos`

The shard sends the result back:

```text
Shard 2
   │
   ▼
 mongos
```

---

## Step 7 — `mongos` Returns The Result

Finally:

```text
mongos
   │
   ▼
Application
```

The complete flow:

```text
APPLICATION
     │
     │ 1. Query
     ▼
  mongos
     │
     │ 2. Examine shard-key value
     │
     │ 3. Use routing metadata
     ▼
Relevant SHARD
     │
     │ 4. Execute
     ▼
  DOCUMENT
     │
     │ 5. Result
     ▼
  mongos
     │
     │ 6. Return
     ▼
APPLICATION
```

That's the query-routing flow I want to remember.

---

# 4. Why Is The Shard Key So Important?

Because it affects two major things:

```text
                  SHARD KEY
                      │
             ┌────────┴────────┐
             ▼                 ▼
      Data Distribution    Query Routing
             │                 │
             ▼                 ▼
      Keep workload       Find relevant
       distributed         shard(s)
```

So I shouldn't think:

> "Shard key is just used to split data."

A better mental model is:

> **The shard key influences both where my data lives and how MongoDB can find it.**

---

# 5. Targeted Query

If MongoDB can determine the relevant shard(s), I get a **targeted query**.

Example:

```javascript
db.users.find({
    userId: 8472
})
```

with:

```text
Shard Key = userId
```

Flow:

```text
Application
     ↓
   mongos
     ↓
Shard 2
     ↓
Result
```

This is efficient because MongoDB doesn't need to involve every shard.

---

# 6. Scatter-Gather

Now suppose my shard key is:

```text
userId
```

but I query:

```javascript
db.users.find({
    age: 20
})
```

The query doesn't provide useful shard-key information.

Now `mongos` may need to send the query to multiple shards:

```text
                    Application
                         │
                         ▼
                      mongos
                    /    │    \
                   ▼     ▼     ▼
                Shard 1 Shard 2 Shard 3
                   │      │      │
                   ▼      ▼      ▼
                Results Results Results
                   \      │      /
                    \     │     /
                      mongos
                         │
                         ▼
                    Application
```

This is **scatter-gather**.

The mental model:

```text
No useful targeting
        ↓
Ask multiple shards
        ↓
Gather results
```

Scatter-gather isn't automatically wrong.

But if my important queries constantly need every shard, that can become expensive as the cluster grows.

---

# 7. Targeted vs Scatter-Gather

I want to remember this visually:

```text
TARGETED

Query
  ↓
mongos
  ↓
Shard 2
```

```text
SCATTER-GATHER

Query
  ↓
mongos
  ↓
┌────┬────┬────┐
S1   S2   S3
└────┴────┴────┘
       ↓
 Gather results
```

So:

```text
Targeted
→ Relevant shard(s)

Scatter-Gather
→ Multiple/all relevant shards
```

---

# 8. Cardinality

Now I need another important concept:

## Cardinality

Cardinality means:

> **How many distinct values a field has.**

For example:

```text
gender
```

might have:

```text
Male
Female
Other
```

Very few distinct values.

That's:

```text
Low Cardinality
```

But:

```text
userId
```

could have:

```text
1
2
3
4
...
1,000,000
```

That's:

```text
High Cardinality
```

So:

```text
gender  → Low Cardinality

userId  → High Cardinality
```

---

# 9. Why Does Cardinality Matter?

Suppose I use:

```text
country
```

as my shard key.

And 90% of my users are from India.

My distribution could become highly uneven:

```text
Shard 1 → ████████████████████
Shard 2 → ██
Shard 3 → █
```

Now I have multiple shards, but one shard might receive far more data/workload than the others.

That's not what I want.

I want something closer to:

```text
Shard 1 → ████████
Shard 2 → ████████
Shard 3 → ████████
```

So cardinality is one thing I consider when choosing a shard key.

---

# 10. High Cardinality ≠ Automatically Good

I don't want to memorize:

```text
High cardinality = good
Low cardinality = bad
```

It's not that simple.

A shard key also needs to fit my workload.

I need to think about:

```text
Query patterns
Write patterns
Data distribution
Hotspots
Cardinality
```

So:

> **A shard key is an architectural decision, not a random field selection.**

---

# 11. Hotspots

A hotspot happens when one part of my sharded cluster receives a disproportionate amount of activity.

For example, imagine new documents constantly arrive with increasing values:

```text
10:00
10:01
10:02
10:03
...
```

If my shard-key design causes new writes to concentrate in one part of the shard-key space:

```text
                 New Writes
                    ↓↓↓
                 Shard 3 🔥🔥🔥🔥
                /            \
          Shard 1            Shard 2
             🙂                  🙂
```

Shard 3 becomes overloaded.

So when choosing a shard key, I also ask:

> **Can this key create a hotspot?**

---

# 12. Compound Shard Keys

A shard key doesn't have to be one field.

I can have a compound shard key such as:

```javascript
{
    country: 1,
    userId: 1
}
```

So:

```text
country + userId
       │
       ▼
Compound Shard Key
```

This can be useful when one field alone doesn't fit my distribution and query requirements.

I'll study compound shard keys more deeply later.

---

# 13. Example: Orders

Suppose my order document is:

```javascript
{
    orderId: "ORD982731",
    userId: 8472,
    country: "India",
    status: "shipped",
    createdAt: ISODate("...")
}
```

Possible candidates:

```text
orderId
userId
country
createdAt
```

I shouldn't simply choose the field that looks most unique.

Instead, I ask:

```text
How does my application query orders?

How quickly does the data grow?

Which field distributes the workload well?

Can writes become concentrated?

Can important queries target the shard?
```

Maybe my application frequently does:

```javascript
db.orders.find({
    userId: 8472
})
```

Then `userId` becomes an interesting candidate.

The important lesson is:

> **The best shard key depends on my application's workload, not just my document structure.**

---

# 14. My Mental Model For Choosing A Shard Key

I want to think:

```text
                  SHARD KEY
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   Distribution     Queries        Writes
        │             │             │
        ▼             ▼             ▼
    Balanced       Targetable    Avoid major
     workload       queries       hotspots
```

I won't always get perfection.

But these are the things I need to evaluate.

---

# 🧠 What I Learned

### Shard Key

A field or set of fields used by MongoDB for sharding.

### Cardinality

Number of distinct values in a field.

### Targeted Query

```text
Query
  ↓
mongos
  ↓
Relevant shard(s)
```

### Scatter-Gather

```text
Query
  ↓
mongos
  ↓
Multiple shards
  ↓
Gather results
```

### Hotspot

One part of the cluster receives disproportionately high workload.

---

# 🔥 The Most Important Mental Model

When I hear:

> **Shard Key**

I should immediately think:

```text
                 SHARD KEY
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   DATA DISTRIBUTION       QUERY ROUTING
          │                     │
          ▼                     ▼
     Where data lives      Where query goes
```

That's the real importance of the shard key.

---

# 🧪 Self-Test

Before moving on, I should be able to explain:

1. What is a shard key?
2. Why does MongoDB need one?
3. How does `mongos` use shard-key information?
4. What role do Config Servers play in routing?
5. What is a targeted query?
6. What is scatter-gather?
7. What does cardinality mean?
8. What is a hotspot?
9. Why isn't high cardinality alone enough?
10. Why should I consider my application's query patterns before choosing a shard key?

If I can explain these without looking at my README, I actually understand the lesson.

---

# 🔥 My Final Summary

> **A shard key is the foundation of MongoDB's sharding distribution and routing strategy. `mongos` uses shard-key information together with cluster metadata to determine which shard(s) should handle a query. A well-designed shard key helps distribute workload and enables targeted queries, while a poor one can create hotspots and excessive scatter-gather operations.**

---

# Next Lesson — Chunks & Data Distribution

Now I understand:

```text
Document
   ↓
Shard Key
   ↓
Distribution + Routing
```

But I still have one major question:

> **How does MongoDB actually organize the shard-key values and divide the data among the shards?**

That's where **Chunks** come in.

```text
Shard Key
    ↓
Chunks
    ↓
Shards
```

That's the next piece of the puzzle.
