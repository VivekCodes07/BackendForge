# MongoDB Sharding — Lesson 2

## Sharded Cluster Architecture

In Lesson 1, I understood **why MongoDB Sharding exists**.

If my dataset becomes too large for one MongoDB server, I can distribute that data across multiple machines.

```text
                    HUGE DATASET
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           Shard 1    Shard 2    Shard 3
```

But that immediately gives me a problem:

> **If my data is spread across multiple machines, how does my application know where to send a query?**

And even more importantly:

> **Who keeps track of all these shards?**

That's what I'm learning in this lesson.

---

# 1. First, I Need The Big Picture

A MongoDB Sharded Cluster has three major pieces:

```text
                    APPLICATION
                         │
                         ▼
                      mongos
                   Query Router
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
          Shard 1     Shard 2     Shard 3
             │           │           │
          Replica      Replica      Replica
             Set         Set         Set

                         +

                  Config Servers
```

At first this looks complicated.

But I can break it into four simple responsibilities:

```text
mongos
→ "Where should this request go?"

Shards
→ "I store the actual application data."

Replica Sets
→ "I keep copies of that shard's data."

Config Servers
→ "I keep track of the cluster's metadata."
```

That's the architecture.

Now I want to understand **what actually happens when I send a query.**

---

# 2. The Query Flow — Step By Step

Suppose my application wants to find a user:

```javascript
db.users.findOne({
    userId: 8472
})
```

My application doesn't directly connect to:

```text
Shard 1
Shard 2
Shard 3
```

Instead, it connects to:

```text
mongos
```

So the first part of the flow is:

```text
Application
     │
     │ Query
     ▼
   mongos
```

Now what happens?

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
     │ "Find user 8472"
     ▼
   mongos
```

---

## Step 2 — `mongos` Receives The Request

`mongos` is the **query router**.

Its job is basically:

> "I need to figure out which shard(s) should handle this request."

But how can it know?

It needs information about the cluster.

---

# 3. Config Servers

This is where Config Servers come in.

Config Servers maintain important **metadata about the sharded cluster**.

I can think of metadata as:

> **Information that tells MongoDB how the cluster is organized.**

Conceptually, the metadata can tell MongoDB things like:

```text
Which databases/collections are sharded?

What shard key is being used?

Which chunks/ranges belong to which shard?

How is the sharded data currently distributed?
```

So my mental picture becomes:

```text
                  Config Servers
                        │
                        │ Cluster metadata
                        ▼
                     mongos
                        │
                        │ "Now I know
                        │  where to route."
                        ▼
                      Shard
```

I don't need to memorize the internal metadata structures yet.

The important thing is:

> **Config Servers help the cluster know how its sharded data is organized.**

---

# 4. Step 3 — `mongos` Determines Where To Send The Query

Now `mongos` has the information it needs.

Conceptually:

```text
Query:
userId = 8472

        ↓

Shard-key / routing information

        ↓

Relevant shard

        ↓

Send request
```

For example:

```text
mongos
   │
   │ userId = 8472
   ▼
Shard 2
```

The exact routing mechanism depends on the shard-key configuration and metadata, which I'll study more deeply in the next lessons.

For now:

> **`mongos` decides which shard(s) need to receive the request.**

---

# 5. Step 4 — The Shard Processes The Request

Now the request reaches the relevant shard.

```text
mongos
   │
   ▼
Shard 2
```

But remember something from my Replication lessons:

> **A shard is typically backed by a Replica Set.**

So I might actually have:

```text
                    Shard 2
                       │
                 Replica Set
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
           Primary  Secondary Secondary
```

This means Sharding and Replication aren't competing concepts.

They solve different problems.

```text
Sharding
→ Distribute different portions of data

Replication
→ Keep multiple copies of each portion
```

Together:

```text
            SHARDING
                │
       Distribute the data
                │
                ▼
          ┌─────┼─────┐
          ▼     ▼     ▼
        Shard  Shard  Shard
          │     │     │
          ▼     ▼     ▼
      Replica Replica Replica
        Sets    Sets    Sets
```

---

# 6. Step 5 — The Result Comes Back

Suppose Shard 2 finds:

```javascript
{
    userId: 8472,
    name: "Vivek"
}
```

The result travels back:

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
     │ 2. Determine routing
     │
     │ ← cluster metadata
     │    from Config Servers
     │
     ▼
Relevant Shard
     │
     │ 3. Execute
     ▼
  Result
     │
     ▼
   mongos
     │
     │ 4. Return
     ▼
Application
```

---

# 7. So What Exactly Is `mongos`?

Now I can define it properly:

> **`mongos` is the query router that sits between my application and the shards of a sharded cluster.**

Its job is to:

```text
Receive request
      ↓
Determine relevant shard(s)
      ↓
Send request
      ↓
Receive result(s)
      ↓
Return result to application
```

The easiest way I remember it:

```text
mongos
   ↓
ROUTES
```

It doesn't normally store my application data.

---

# 8. What Exactly Is A Shard?

A shard is a logical portion of my sharded dataset.

For example:

```text
             Complete Dataset
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       Shard 1   Shard 2   Shard 3
```

Each shard stores part of the overall data.

And in a production architecture, a shard is typically a Replica Set:

```text
Shard 1
   │
   └── Replica Set

Shard 2
   │
   └── Replica Set

Shard 3
   │
   └── Replica Set
```

So:

> **Shard = portion of the data**

> **Replica Set = copies/protection for that portion**

---

# 9. Why Combine Sharding And Replication?

Imagine I have three shards:

```text
Shard 1
Shard 2
Shard 3
```

Without replication, if Shard 2's only server dies:

```text
Shard 2 ❌
```

I lose availability for the data that lived there.

But with a Replica Set:

```text
                  Shard 2
                     │
              ┌──────┼──────┐
              ▼      ▼      ▼
           Primary Secondary Secondary
```

if the Primary fails, the Replica Set can elect another Primary.

So I get:

```text
Sharding
→ Scalability / Data Distribution

Replication
→ High Availability / Redundancy
```

This is why they are commonly used together.

---

# 10. Config Servers

Config Servers have a different responsibility.

They don't exist to store my application's normal documents.

Instead, they maintain metadata about the sharded cluster.

So:

```text
┌─────────────────────┐
│     Config Servers  │
│                     │
│ Cluster Metadata    │
└─────────────────────┘
```

while:

```text
┌─────────────────────┐
│       Shards        │
│                     │
│ Application Data    │
└─────────────────────┘
```

This distinction is extremely important.

---

# 11. Config Servers Are Replicated Too

Config Server metadata is important.

I don't want my cluster to depend on one lonely Config Server.

So Config Servers are typically deployed as a **Config Server Replica Set**.

Conceptually:

```text
             CONFIG SERVER RS

                  Primary
                     │
              ┌──────┴──────┐
              ▼             ▼
         Secondary      Secondary
```

Again, Replication appears.

That's why understanding Replica Sets before Sharding was useful.

---

# 12. Can I Have Multiple `mongos`?

Yes.

I don't necessarily want:

```text
Application
     │
     ▼
One mongos
     │
     ▼
Cluster
```

to become a single point of dependency.

I can have multiple `mongos` instances:

```text
                  Application
                /      |      \
               ▼       ▼       ▼
           mongos   mongos   mongos
               \       |       /
                \      |      /
                 Sharded Cluster
```

This allows the routing layer to scale and provides more availability.

---

# 13. The Complete Architecture

Now I can finally see everything together:

```text
                         APPLICATION
                              │
                              ▼
                    ┌─────────────────┐
                    │      mongos      │
                    │   Query Router   │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
           ┌────────┐   ┌────────┐   ┌────────┐
           │ Shard 1│   │ Shard 2│   │ Shard 3│
           └────┬───┘   └────┬───┘   └────┬───┘
                │            │            │
             Replica      Replica      Replica
                Set          Set          Set

                             ▲
                             │
                    Cluster Metadata
                             │
                             ▼
                    ┌─────────────────┐
                    │ Config Servers  │
                    │  Replica Set    │
                    └─────────────────┘
```

---

# 14. My Four-Word Mental Model

I can remember the whole architecture using four words:

```text
mongos
→ ROUTE

Shards
→ STORE

Replica Sets
→ PROTECT

Config Servers
→ TRACK
```

That's it.

If I remember those four responsibilities, the architecture becomes much easier.

---

# 15. What Happens When I Send A Query?

My final mental flow:

```text
1. Application
       │
       ▼
2. mongos
       │
       ▼
3. Check routing information
       │
       ▼
4. Relevant shard(s)
       │
       ▼
5. Execute query
       │
       ▼
6. Result returns to mongos
       │
       ▼
7. Application receives result
```

And behind the scenes:

```text
Config Servers
      │
      │ Maintain cluster metadata
      ▼
    mongos
```

---

# 🧠 What I Learned

* A sharded cluster distributes data across multiple shards.
* `mongos` is the query router.
* Shards store portions of my application data.
* A shard is typically backed by a Replica Set.
* Replica Sets provide redundancy and failover.
* Config Servers maintain important metadata about the sharded cluster.
* Config Servers are typically deployed as a Replica Set.
* Multiple `mongos` instances can be used.
* My application communicates through `mongos` rather than needing to know where individual data lives.

---

# 🔥 My One-Line Summary

> **`mongos` is the traffic controller, shards store the distributed data, Replica Sets protect that data, and Config Servers keep track of how the cluster is organized.**

---

# Next Lesson

Now I understand **the architecture and the basic request flow**.

But I still haven't answered the most important question:

> **How exactly does `mongos` know which shard should receive my query?**

That's where **Shard Keys** come in.

```text
Application
     ↓
   mongos
     ↓
Shard Key
     ↓
Routing decision
     ↓
Relevant shard(s)
```

That is the focus of Lesson 3.
