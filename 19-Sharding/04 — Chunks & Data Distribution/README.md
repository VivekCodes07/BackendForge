# MongoDB Sharding — Lesson 4

## Chunks & Data Distribution

In the previous lessons, I understood:

```text
Sharding
   ↓
Multiple Shards
   ↓
Shard Key
   ↓
mongos uses the shard key
to route queries
```

But now I have one important question:

> **I understand that the shard key helps MongoDB decide where data belongs, but how is the actual data divided between the shards?**

This is where **Chunks** come into the picture.

---

# 1. First, My Mental Model

Suppose I have:

```text
1,000,000 users
```

and:

```text
Shard 1
Shard 2
Shard 3
```

My shard key is:

```text
userId
```

I shouldn't imagine MongoDB doing this:

```text
user 1 → Shard 1
user 2 → Shard 2
user 3 → Shard 3
user 4 → Shard 1
...
```

That's not the mental model I want.

Instead:

```text
Documents
    ↓
Shard Key
    ↓
Shard-Key Space
    ↓
Chunks
    ↓
Shards
```

So the important relationship is:

> **Document → Shard Key → Chunk → Shard**

This one line explains most of today's lesson.

---

# 2. What Exactly Is A Chunk?

A **chunk is a logical range of shard-key values**.

Suppose:

```text
Shard Key = userId
```

MongoDB can divide the shard-key space into ranges.

For example:

```text
1 ─────────────── 1000
      Chunk A

1000 ─────────── 2000
      Chunk B

2000 ─────────── 3000
      Chunk C

3000 ─────────── 4000
      Chunk D
```

So:

```text
Chunk A → userId values in its range

Chunk B → userId values in its range

Chunk C → userId values in its range

Chunk D → userId values in its range
```

I should think of a chunk as:

> **A piece of the shard-key space.**

Not simply:

> "A group of random documents."

---

# 3. Why Does MongoDB Use Chunks?

Imagine I have:

```text
Shard 1 → 90% of workload
Shard 2 → 5%
Shard 3 → 5%
```

That's obviously not balanced.

Now imagine MongoDB divided the data into manageable chunks:

```text
Shard 1
 ├── Chunk A
 ├── Chunk B
 ├── Chunk C
 ├── Chunk D
 └── Chunk E

Shard 2
 └── Chunk F

Shard 3
 └── Chunk G
```

Now MongoDB has something it can redistribute.

For example:

```text
Chunk D
```

can potentially move from:

```text
Shard 1
```

to:

```text
Shard 2
```

So chunks make **data redistribution possible without treating an entire shard as one giant block**.

---

# 4. One Shard Can Have Many Chunks

This is important.

A shard is NOT equal to one chunk.

I can have:

```text
Shard 1
 ├── Chunk A
 ├── Chunk B
 ├── Chunk C
 └── Chunk D
```

while:

```text
Shard 2
 ├── Chunk E
 └── Chunk F
```

and:

```text
Shard 3
 ├── Chunk G
 ├── Chunk H
 └── Chunk I
```

So:

```text
              Shards
                │
        ┌───────┼───────┐
        ▼       ▼       ▼
      Shard 1 Shard 2 Shard 3
        │       │       │
        ▼       ▼       ▼
      A B C D   E F     G H I
```

A shard can therefore contain **many chunks**.

---

# 5. How Does A Document Fit Into This?

Suppose I have:

```javascript
{
    userId: 1547,
    name: "Vivek"
}
```

and:

```text
Shard Key = userId
```

MongoDB looks at:

```text
userId = 1547
```

and determines which chunk's range contains that value.

For example:

```text
Chunk A → 1–1000
Chunk B → 1000–2000
Chunk C → 2000–3000
```

Then:

```text
1547
 ↓
Chunk B
```

If Chunk B currently belongs to Shard 2:

```text
1547
 ↓
Chunk B
 ↓
Shard 2
```

So my mental model becomes:

```text
Document
   ↓
userId = 1547
   ↓
Chunk B
   ↓
Shard 2
```

---

# 6. Query Routing + Chunks

This connects directly to what I learned in Lesson 3.

Suppose I run:

```javascript
db.users.findOne({
    userId: 1547
})
```

The flow is:

```text
                 APPLICATION
                      │
                      │ Query
                      ▼
                   mongos
                      │
                      │ userId = 1547
                      ▼
                 SHARD KEY
                      │
                      ▼
                    CHUNK
                      │
                      ▼
                   SHARD 2
                      │
                      ▼
                  DOCUMENT
```

Let's understand it step by step.

---

## Step 1 — Application Sends The Query

```javascript
db.users.findOne({
    userId: 1547
})
```

Flow:

```text
Application
     │
     ▼
mongos
```

---

## Step 2 — `mongos` Looks At The Query

It sees:

```text
userId = 1547
```

and knows:

```text
userId
```

is the shard key.

So this query contains useful routing information.

---

## Step 3 — `mongos` Determines The Relevant Chunk

MongoDB's sharding metadata tells `mongos` how the shard-key ranges are distributed.

Conceptually:

```text
1 ───── 1000 → Chunk A
1000 ─ 2000 → Chunk B
2000 ─ 3000 → Chunk C
```

Since:

```text
1547
```

falls into:

```text
Chunk B
```

MongoDB knows:

```text
1547 → Chunk B
```

---

## Step 4 — `mongos` Finds The Shard Owning That Chunk

Suppose:

```text
Chunk B → Shard 2
```

Now the route is known:

```text
1547
 ↓
Chunk B
 ↓
Shard 2
```

---

## Step 5 — Query Goes To Shard 2

```text
mongos
   │
   ▼
Shard 2
```

The shard executes the query.

---

## Step 6 — Result Comes Back

```text
Shard 2
   │
   ▼
mongos
   │
   ▼
Application
```

So the complete flow is:

```text
Application
     │
     │ 1. Query
     ▼
   mongos
     │
     │ 2. Read shard-key value
     ▼
  Shard Key
     │
     │ 3. Determine range
     ▼
   Chunk B
     │
     │ 4. Find owning shard
     ▼
  Shard 2
     │
     │ 5. Execute
     ▼
  Document
     │
     │ 6. Return
     ▼
   mongos
     │
     ▼
Application
```

🔥 This is the connection between **shard key, chunks, and query routing**.

---

# 7. Who Knows Which Chunk Belongs To Which Shard?

This is where my previous lesson about **Config Servers** becomes important.

The Config Server Replica Set maintains the sharding metadata.

Conceptually:

```text
             Config Servers
                   │
                   │
                   │ Metadata
                   ▼
                 mongos
```

The metadata can tell the cluster things such as:

```text
Chunk A → Shard 1
Chunk B → Shard 2
Chunk C → Shard 3
```

So `mongos` doesn't randomly guess where a document lives.

It uses the cluster's metadata to make the routing decision.

---

# 8. The Balancer

Now suppose my chunks are distributed like this:

```text
Shard 1 → A B C D E F
Shard 2 → G
Shard 3 → H
```

That's heavily unbalanced.

MongoDB has a **balancer** that helps maintain an appropriate distribution of chunks across shards.

Conceptually:

```text
                BALANCER
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
   Heavily loaded         Less loaded
       shard                  shard
          │                   │
          └─────────┬─────────┘
                    ▼
              Move chunks
```

The goal is to prevent the cluster from becoming unnecessarily uneven.

---

# 9. Chunk Migration

Suppose:

```text
Shard 1
 ├── A
 ├── B
 ├── C
 ├── D
 └── E

Shard 2
 └── F
```

If MongoDB decides that the distribution should be adjusted, a chunk can be migrated.

For example:

```text
Chunk E
```

moves:

```text
Shard 1 → Shard 2
```

Before:

```text
Shard 1 → A B C D E
Shard 2 → F
```

After:

```text
Shard 1 → A B C D
Shard 2 → E F
```

This movement is called:

> **Chunk Migration**

---

# 10. Why Chunk Migration Is Useful

Imagine I add another shard:

```text
Shard 1
Shard 2
Shard 3
Shard 4 ← New
```

Initially:

```text
Shard 1 → ███████████
Shard 2 → █████████
Shard 3 → █████████
Shard 4 →
```

The new shard won't magically contain a balanced portion of my existing data.

Chunks can be redistributed.

Conceptually:

```text
Before:

Shard 1 → ███████████
Shard 2 → █████████
Shard 3 → █████████
Shard 4 →


After balancing:

Shard 1 → ███████
Shard 2 → ███████
Shard 3 → ███████
Shard 4 → ███████
```

This is one of the reasons sharding supports **horizontal scaling**.

---

# 11. Chunk Migration — The Basic Flow

Suppose:

```text
Chunk C
```

currently belongs to:

```text
Shard 1
```

but needs to move to:

```text
Shard 2
```

The simplified flow I want to remember is:

```text
          Balancing Decision
                  │
                  ▼
          Move Chunk C
                  │
                  ▼
        Shard 1 (Source)
                  │
                  │ Copy/migrate data
                  ▼
       Shard 2 (Destination)
                  │
                  │ Synchronize
                  ▼
        Update cluster metadata
```

The real migration process has more internal details, but this is the correct mental model for now.

---

# 12. What Happens To Routing After Migration?

This is extremely important.

Suppose before migration:

```text
Chunk C → Shard 1
```

After migration:

```text
Chunk C → Shard 2
```

The cluster's metadata needs to reflect the new ownership.

Conceptually:

```text
Before:

Metadata
   │
   └── Chunk C → Shard 1


Migration
     ↓


After:

Metadata
   │
   └── Chunk C → Shard 2
```

Now `mongos` can route future queries correctly.

So chunk migration isn't just:

```text
"Move data."
```

It's also:

```text
"Update the cluster's knowledge
about where that data now lives."
```

---

# 13. What I Should NOT Imagine

I don't want to imagine that MongoDB randomly moves individual documents around whenever the cluster needs balancing.

My primary mental model should be:

```text
Shard Key
    ↓
Shard-Key Space
    ↓
Chunks
    ↓
Chunks are distributed across shards
    ↓
Chunks can migrate between shards
```

So:

> **Chunks are the logical units MongoDB uses to organize and redistribute sharded data.**

---

# 14. The Complete Picture

Now I can connect everything I've learned so far:

```text
                       COLLECTION
                           │
                           ▼
                       SHARD KEY
                           │
                           ▼
                    SHARD-KEY SPACE
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
           CHUNK A      CHUNK B      CHUNK C
              │            │            │
              ▼            ▼            ▼
           SHARD 1      SHARD 2      SHARD 3
              │            │            │
              ▼            ▼            ▼
         Replica Set   Replica Set   Replica Set
```

And the query flow:

```text
Application
     │
     ▼
   mongos
     │
     ▼
Shard-key value
     │
     ▼
   Chunk
     │
     ▼
   Shard
     │
     ▼
Document
```

And if the distribution becomes uneven:

```text
Unbalanced Distribution
          │
          ▼
       Balancer
          │
          ▼
   Chunk Migration
          │
          ▼
     Another Shard
```

---

# 15. Shard vs Chunk

I don't want to confuse these anymore.

### Shard

A shard is a **logical portion of the overall distributed dataset**.

```text
Cluster
 ├── Shard 1
 ├── Shard 2
 └── Shard 3
```

### Chunk

A chunk is a **logical range of shard-key values** that belongs to a shard at a particular time.

```text
Shard 1
 ├── Chunk A
 ├── Chunk B
 └── Chunk C
```

So:

```text
Shard
  ↓
contains
  ↓
Chunks
```

---

# 16. My Mental Model For The Important Terms

### Shard Key

> The field(s) MongoDB uses as the basis for sharding.

### Chunk

> A logical range of the shard-key space.

### Shard

> A part of the distributed dataset that owns chunks.

### Config Servers

> Keep the cluster's sharding metadata.

### Balancer

> Helps keep chunk distribution appropriately balanced across shards.

### Chunk Migration

> Moving a chunk from one shard to another.

---

# 🧠 The Diagram I Want To Remember

If I forget everything else, I want to remember this:

```text
                    DOCUMENT
                        │
                        ▼
                    SHARD KEY
                        │
                        ▼
                      CHUNK
                        │
                        ▼
                      SHARD
                        │
                        ▼
                  REPLICA SET
```

And for routing:

```text
Application
     │
     ▼
   mongos
     │
     ▼
Shard-key value
     │
     ▼
Find relevant chunk
     │
     ▼
Find chunk's shard
     │
     ▼
Query shard
     │
     ▼
Return result
```

And for balancing:

```text
Too much workload/data
          │
          ▼
       Balancer
          │
          ▼
   Chunk Migration
          │
          ▼
   Another Shard
```

---

# 🧪 Self-Test

Before I move to the next lesson, I should be able to explain these in my own words:

### 1. What is a chunk?

### 2. Why doesn't MongoDB simply divide the entire collection into one part per shard?

### 3. Can one shard contain multiple chunks?

### 4. How does a document get associated with a chunk?

### 5. How does a query go from:

```text
Shard Key → Chunk → Shard
```

### 6. What is the role of the Config Servers here?

### 7. What is the balancer?

### 8. What is chunk migration?

### 9. Why is chunk migration useful when adding a new shard?

### 10. What happens to routing metadata after a chunk moves?

If I can explain those without reading this README, I actually understand the lesson.

---

# 🔥 My Final Summary

If I had to teach this lesson to myself in a few lines:

> **MongoDB doesn't think of my sharded collection as simply "documents assigned directly to shards." The shard key creates a key space, that space is divided into chunks, and those chunks are distributed across shards. If the distribution becomes unbalanced, chunks can be migrated between shards. The cluster's metadata keeps track of where those chunks currently belong, allowing `mongos` to route queries correctly.**

My complete mental model is:

```text
                SHARDING
                    │
                    ▼
                SHARD KEY
                    │
                    ▼
                 CHUNKS
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       Shard 1   Shard 2   Shard 3
          │         │         │
          ▼         ▼         ▼
      Replica    Replica    Replica
        Set        Set        Set
```

And if things become unbalanced:

```text
Unbalanced
    ↓
Balancer
    ↓
Chunk Migration
    ↓
Better Distribution
```

That's the core idea of **Chunks & Data Distribution**.

---

# 🚀 Next Lesson

Now I understand:

```text
Shard Key
    ↓
Chunks
    ↓
Shards
```

But there's another important question:

> **How does MongoDB actually detect that the cluster is unbalanced, and what exactly happens when chunks are migrated?**

That leads into the deeper mechanics of **Balancing & Chunk Migration**.
