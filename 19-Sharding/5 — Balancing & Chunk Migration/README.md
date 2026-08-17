# MongoDB Sharding — Lesson 5

## Balancing & Chunk Migration

In the previous lesson, I understood that MongoDB doesn't simply throw documents randomly across shards.

The mental model I have now is:

```text
Document
    ↓
Shard Key
    ↓
Chunk
    ↓
Shard
```

I also learned that chunks can move between shards.

So naturally, I have a question:

> **Who decides that a chunk needs to move, where does it move, and what actually happens while it is moving?**

That's what I am learning in this lesson.

---

# 1. Why Do I Need Balancing?

Suppose I have three shards:

```text
Shard 1 → ████████████████████
Shard 2 → █████
Shard 3 → ████
```

Clearly, my cluster isn't distributed very evenly.

If most of the relevant data or workload is concentrated on Shard 1, then simply having three shards doesn't automatically mean I am getting the benefits of three shards.

I want the data to be distributed more appropriately.

That's where **balancing** comes in.

My basic idea is:

```text
Unbalanced cluster
        ↓
    Balancing
        ↓
Better distribution
```

---

# 2. What Is The Balancer?

The **balancer** is responsible for helping maintain an appropriate distribution of chunks across the shards in a sharded cluster.

I should NOT think of it as:

> "The balancer moves every document until everything is exactly equal."

Instead, I should think:

> **The balancer manages chunk distribution so that the cluster doesn't become unnecessarily uneven.**

The important unit here is still the:

```text
Chunk
```

So:

```text
Balancer
    ↓
Moves chunks
    ↓
Between shards
```

---

# 3. Why Chunks Make Balancing Possible

Imagine Shard 1 contains:

```text
Shard 1
 ├── Chunk A
 ├── Chunk B
 ├── Chunk C
 ├── Chunk D
 └── Chunk E
```

while Shard 2 contains:

```text
Shard 2
 └── Chunk F
```

MongoDB has something it can redistribute.

For example:

```text
Chunk E
```

could be migrated:

```text
Shard 1 → Shard 2
```

Afterward:

```text
Shard 1
 ├── A
 ├── B
 ├── C
 └── D

Shard 2
 ├── E
 └── F
```

So the whole concept depends heavily on the fact that **chunks are movable units of sharded data**.

---

# 4. My Mental Model Of Balancing

I want to remember the process like this:

```text
          Cluster
             ↓
     Distribution checked
             ↓
      Is adjustment needed?
             ↓
            Yes
             ↓
     Choose migration
             ↓
      Move a chunk
             ↓
      Update metadata
             ↓
       Cluster continues
```

This is much better than simply memorizing:

> "MongoDB has a balancer."

I want to understand what that actually means.

---

# 5. Source Shard And Destination Shard

Whenever a chunk moves, there are two important sides.

### Source Shard

The shard that currently owns the chunk.

```text
Shard 1
   │
   └── Chunk C
```

### Destination Shard

The shard that will receive the chunk.

```text
Shard 2
```

So migration looks like:

```text
              Chunk C
                 │
                 ▼
          ┌─────────────┐
          │   Shard 1   │
          │   SOURCE    │
          └──────┬──────┘
                 │
                 │ Migration
                 ▼
          ┌─────────────┐
          │   Shard 2   │
          │ DESTINATION │
          └─────────────┘
```

---

# 6. The Complete Chunk Migration Flow

This is the most important part of this lesson.

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

MongoDB decides that:

```text
Chunk E
```

should move from Shard 1 to Shard 2.

The simplified flow is:

```text
1. Detect imbalance
        ↓
2. Select source shard
        ↓
3. Select destination shard
        ↓
4. Select chunk
        ↓
5. Start migration
        ↓
6. Copy chunk data
        ↓
7. Track changes happening during migration
        ↓
8. Finish migration
        ↓
9. Update metadata
        ↓
10. New routing information becomes active
```

Now I want to understand each step.

---

# 7. Step 1 — MongoDB Detects That Distribution Needs Adjustment

MongoDB has information about how chunks are distributed across the cluster.

Conceptually:

```text
Shard 1 → A B C D E
Shard 2 → F
Shard 3 → G
```

This distribution may indicate that balancing work is useful.

The important thing is:

> **The balancer operates based on the cluster's chunk distribution and balancing rules.**

It isn't simply looking at:

```text
"Shard 1 has more documents, therefore move something."
```

There are several factors and internal rules involved.

For my current understanding, the important idea is:

```text
Chunk distribution
        ↓
Balancing decision
```

---

# 8. Step 2 — Choose The Source Shard

Suppose:

```text
Shard 1 → A B C D E
Shard 2 → F
Shard 3 → G
```

The balancer may identify Shard 1 as a source for migration.

So:

```text
Source
   ↓
Shard 1
```

The chunk that will be moved might be:

```text
Chunk E
```

---

# 9. Step 3 — Choose The Destination Shard

Now MongoDB needs somewhere to put the chunk.

For example:

```text
Destination
     ↓
Shard 2
```

So now I have:

```text
Chunk E

Source      → Destination
Shard 1     → Shard 2
```

---

# 10. Step 4 — Select The Chunk

Now the specific chunk is selected.

Suppose:

```text
Chunk E
```

represents a range of shard-key values:

```text
5000 → 6000
```

Conceptually:

```text
5000 ───────────────── 6000
            Chunk E
```

That means the migration is about moving the data belonging to that chunk's shard-key range.

---

# 11. Step 5 — Migration Starts

Now the actual migration begins.

Before:

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

The migration is:

```text
Chunk E
    │
    ▼
Shard 1 ───────────→ Shard 2
```

But this isn't simply:

```text
copy()
delete()
```

There is coordination involved because the cluster is still serving normal traffic.

---

# 12. Step 6 — Data Is Copied To The Destination

The data belonging to the chunk is copied from:

```text
Source Shard
```

to:

```text
Destination Shard
```

Conceptually:

```text
             Chunk E
                │
                │
        ┌───────┴────────┐
        ▼                ▼
    Shard 1           Shard 2
    SOURCE          DESTINATION
```

At this point, I should NOT assume that Shard 1 immediately forgets about the chunk.

There is still migration work happening.

---

# 13. What About Writes During Migration?

This is where chunk migration becomes more interesting.

Imagine a user updates a document belonging to the chunk while the migration is happening.

MongoDB can't simply say:

> "Sorry, I'm moving this chunk. Come back later."

The system has to coordinate the migration with ongoing operations.

Conceptually:

```text
Normal Application Traffic
          │
          ▼
     Cluster keeps
       operating
          │
          ▼
Migration happens
in the background
```

Changes that happen during the migration need to be accounted for so that the destination ends up with the correct state.

For my mental model:

```text
Copy existing data
        ↓
Track/synchronize changes
        ↓
Make destination consistent
```

That's the important idea.

---

# 14. Why Can't MongoDB Just Copy Everything Once?

Imagine:

```text
10:00 AM
```

MongoDB starts copying:

```text
Chunk E
```

At:

```text
10:01 AM
```

the application updates one of the documents inside that chunk.

If MongoDB only copied the old state and ignored the update:

```text
Source → updated document
Destination → old document
```

I would have inconsistent data.

So MongoDB needs a migration process that handles changes occurring while the migration is in progress.

The simplified idea is:

```text
Existing data
     +
Changes during migration
     ↓
Destination reaches correct state
```

---

# 15. Step 7 — Migration Finishes

Once the destination has the required data and the migration is ready to complete, ownership can transition.

Conceptually:

```text
Before:

Chunk E → Shard 1


Migration


After:

Chunk E → Shard 2
```

This ownership change is important because the cluster now needs to know:

> **"Chunk E no longer belongs to Shard 1. It belongs to Shard 2."**

---

# 16. Step 8 — Metadata Gets Updated

Remember the Config Servers?

They maintain important sharding metadata.

Before migration:

```text
Chunk E → Shard 1
```

After migration:

```text
Chunk E → Shard 2
```

So conceptually:

```text
                CONFIG SERVERS
                      │
                      ▼
             Sharding Metadata
                      │
              ┌───────┴───────┐
              │               │
        Before migration   After migration
              │               │
         E → Shard 1      E → Shard 2
```

This is critical for future routing.

---

# 17. What Happens To Future Queries?

Suppose the application now sends:

```javascript
db.users.findOne({
    userId: 5500
})
```

and:

```text
5500
 ↓
Chunk E
```

Before migration:

```text
Chunk E → Shard 1
```

After migration:

```text
Chunk E → Shard 2
```

So `mongos` needs to eventually route the query to:

```text
Shard 2
```

The important flow is:

```text
Query
  ↓
mongos
  ↓
Shard-key value
  ↓
Chunk
  ↓
Current metadata
  ↓
Current owning shard
```

So if chunk ownership changes, **routing knowledge changes too**.

---

# 18. The Complete Migration Diagram

This is the diagram I want to remember:

```text
              Cluster becomes unbalanced
                        │
                        ▼
                   Balancing
                    decision
                        │
                        ▼
                Select source shard
                        │
                        ▼
              Select destination shard
                        │
                        ▼
                  Select chunk
                        │
                        ▼
                Start migration
                        │
                        ▼
             Copy chunk's data
                        │
                        ▼
          Handle/synchronize changes
                        │
                        ▼
             Migration completes
                        │
                        ▼
             Update cluster metadata
                        │
                        ▼
          New routing information
                  becomes active
```

---

# 19. What Happens To The Old Shard?

After successful migration:

```text
Before:

Shard 1 → A B C D E
Shard 2 → F
```

After:

```text
Shard 1 → A B C D
Shard 2 → E F
```

So:

```text
Chunk E
```

is no longer owned by Shard 1.

This is important:

> **The goal isn't to create a duplicate permanent copy of the chunk on both shards.**

The migration eventually results in the chunk being owned by its new shard.

---

# 20. What If Migration Fails?

This is another reason migration needs coordination.

Suppose:

```text
Shard 1 → Source
Shard 2 → Destination
```

and something goes wrong during migration.

MongoDB needs to maintain a consistent state and avoid simply pretending that the move succeeded.

My simplified mental model is:

```text
Migration
    │
    ├── Success
    │     ↓
    │  Ownership changes
    │
    └── Failure
          ↓
     Migration doesn't
     simply become
     "successful"
```

The important lesson:

> **Chunk migration is a coordinated process, not a simple file copy.**

---

# 21. What Happens When I Add A New Shard?

This is one of the most useful real-world scenarios.

Suppose I have:

```text
Shard 1 → ███████████
Shard 2 → █████████
Shard 3 → █████████
```

Now I add:

```text
Shard 4
```

My first thought might be:

> "Great! Shard 4 should immediately contain 25% of my data."

But that's not how I should think about it.

Initially:

```text
Shard 1 → ███████████
Shard 2 → █████████
Shard 3 → █████████
Shard 4 → 
```

The cluster can then redistribute chunks.

Conceptually:

```text
Chunks from existing shards
          │
          ▼
      Migration
          │
          ▼
       Shard 4
```

Eventually the distribution can become more balanced:

```text
Shard 1 → ███████
Shard 2 → ███████
Shard 3 → ███████
Shard 4 → ███████
```

This is one of the big advantages of sharding.

I can scale horizontally by adding more machines/shards and allowing the cluster to redistribute chunks.

---

# 22. But Adding A Shard Doesn't Mean Instant Scaling

This is an important practical point.

Suppose:

```text
Shard 4 → NEW
```

I can't expect:

```text
10:00 AM → add shard
10:01 AM → everything perfectly balanced
```

Chunk migration takes time and consumes resources.

During redistribution, MongoDB has to:

```text
Read data
   ↓
Transfer data
   ↓
Synchronize changes
   ↓
Update metadata
```

So adding capacity and **actually distributing existing data onto that capacity are related but separate processes**.

---

# 23. Why Migration Can Affect Performance

Chunk migration isn't free.

There is network and disk activity involved.

Conceptually:

```text
Source Shard
     │
     │ Data transfer
     ▼
Destination Shard
```

That means resources are being used for migration while the cluster is also handling application traffic.

So:

```text
Application workload
        +
Migration workload
        =
More resource usage
```

This is why I shouldn't think:

> "Balancing is completely free."

It isn't.

---

# 24. The Real Mental Model Of The Balancer

I want to remember:

```text
Balancer
   │
   ├── Watches chunk distribution
   │
   ├── Determines when balancing work
   │   is appropriate
   │
   ├── Coordinates migrations
   │
   └── Helps maintain appropriate
       chunk distribution
```

Not:

```text
Balancer = magic system
that makes every shard identical
```

---

# 25. The Complete Sharding Picture So Far

At this point, my understanding should look like this:

```text
                         APPLICATION
                              │
                              ▼
                            mongos
                              │
                     reads shard-key value
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

Meanwhile:

```text
                    CONFIG SERVERS
                          │
                          │
                   Sharding Metadata
                          │
                          ▼
                       mongos
```

And for balancing:

```text
                  CHUNK DISTRIBUTION
                          │
                          ▼
                       BALANCER
                          │
                          ▼
                   CHUNK MIGRATION
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
           Source Shard       Destination Shard
```

---

# 26. One Complete Example

Let's put everything together.

I have:

```text
Shard 1
Shard 2
Shard 3
```

My shard key is:

```text
userId
```

My chunks are:

```text
Chunk A → 1–1000
Chunk B → 1000–2000
Chunk C → 2000–3000
Chunk D → 3000–4000
```

And ownership is:

```text
Shard 1 → A B C
Shard 2 → D
Shard 3 → 
```

The distribution is uneven.

The balancer decides that:

```text
Chunk C
```

should move:

```text
Shard 1 → Shard 3
```

The flow becomes:

```text
                Chunk C
                   │
                   ▼
              Shard 1
               SOURCE
                   │
                   │ Migration
                   ▼
              Shard 3
            DESTINATION
                   │
                   ▼
         Synchronize changes
                   │
                   ▼
          Migration completes
                   │
                   ▼
        Metadata gets updated
                   │
                   ▼
           Chunk C → Shard 3
```

Now a query:

```javascript
db.users.find({
    userId: 2500
})
```

comes in.

MongoDB sees:

```text
2500
 ↓
Chunk C
 ↓
Shard 3
```

So:

```text
Application
    ↓
mongos
    ↓
userId = 2500
    ↓
Chunk C
    ↓
Shard 3
    ↓
Result
```

This is how **balancing and query routing connect together**.

---

# 27. The One Thing I Must Remember

If I only remember one thing from this lesson:

> **MongoDB balances a sharded cluster by redistributing chunks between shards. During a chunk migration, the data is moved and synchronized while the cluster continues serving traffic, and after the migration completes, the cluster's metadata is updated so future queries know the chunk's new owner.**

The simple version:

```text
Unbalanced
    ↓
Balancer
    ↓
Choose chunk
    ↓
Source → Destination
    ↓
Migrate + synchronize
    ↓
Update metadata
    ↓
New shard owns chunk
```

---

# 🧠 My Final Mental Model

I can now visualize MongoDB Sharding like this:

```text
                     SHARDED CLUSTER
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          SHARD 1       SHARD 2       SHARD 3
             │             │             │
          Chunks         Chunks         Chunks
             │             │             │
             └─────────────┼─────────────┘
                           │
                     BALANCER
                           │
                    Chunk Migration
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
              Source            Destination
                 │                   │
                 └─────────┬─────────┘
                           ▼
                    Metadata Update
```

And query routing:

```text
Application
     ↓
mongos
     ↓
Shard Key
     ↓
Chunk
     ↓
Current Chunk Owner
     ↓
Shard
     ↓
Replica Set
     ↓
Result
```

---

# Self-Test

Before I move on, I should be able to explain:

### 1. Why does MongoDB need a balancer?

### 2. What exactly is being moved during balancing?

### 3. What are the source and destination shards?

### 4. What is chunk migration?

### 5. Why can't MongoDB simply copy a chunk once and immediately delete the source?

### 6. What happens to changes made during migration?

### 7. Why does the cluster metadata need to be updated?

### 8. What happens when I add a new shard?

### 9. Why can chunk migration consume resources?

### 10. After a chunk moves, how does `mongos` know where to send future queries?

If I can explain this flow without looking at my notes:

```text
Unbalanced
   ↓
Balancer
   ↓
Source + Destination
   ↓
Chunk Migration
   ↓
Synchronize
   ↓
Metadata Update
   ↓
New Routing
```

then I understand the core of this lesson.

---

# Final Summary

I started this lesson with:

> **"Okay, chunks can move. But who moves them and what actually happens?"**

Now I understand:

```text
Chunk Distribution
       ↓
    Balancer
       ↓
Migration Decision
       ↓
Source Shard
       ↓
Destination Shard
       ↓
Chunk Data Migration
       ↓
Synchronize Changes
       ↓
Migration Completes
       ↓
Metadata Updated
       ↓
Future Queries Use New Location
```

So my mental model is:

> **The balancer helps maintain an appropriate distribution of chunks across shards. When a chunk needs to move, MongoDB performs a coordinated migration from a source shard to a destination shard, handles changes during the migration, and updates the cluster metadata so routing can continue correctly.**

That's the real idea behind **Balancing & Chunk Migration**.
