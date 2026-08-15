# Oplog — How MongoDB Replication Actually Works

## Where I Was Confused

I already understood the basic idea of replication.

I have a Replica Set:

```text
                    Replica Set

                   ┌───────────┐
                   │  PRIMARY  │
                   └─────┬─────┘
                         │
                 ┌───────┴───────┐
                 ▼               ▼
          ┌───────────┐   ┌───────────┐
          │ SECONDARY │   │ SECONDARY │
          └───────────┘   └───────────┘
```

The Primary handles writes.

The Secondaries maintain copies of the data.

But I had a question:

> **How does the Secondary actually know what changed on the Primary?**

I couldn't just say:

> "MongoDB copies the data."

That doesn't tell me **how** it happens.

And I definitely didn't want to imagine MongoDB doing this after every write:

```text
Primary
   ↓
"Hey Secondary, here's the entire database again."
```

That would make no sense.

So I needed to understand what MongoDB actually keeps track of.

That's where the **oplog** comes in.

---

# 1. First, What Does Oplog Mean?

`oplog` simply means:

> **Operations Log**

The easiest way I remember it:

> **The oplog is a record of changes that happened in the database.**

Not the entire database.

Not a backup.

Not another copy of my collections.

It is basically a **history of recent operations** that replica-set members use for replication.

So instead of thinking:

```text
Primary
   ↓
Copy entire database
   ↓
Secondary
```

I should think:

```text
Primary
   ↓
Something changes
   ↓
Change is recorded in oplog
   ↓
Secondary gets that change
   ↓
Secondary applies it
```

That's the core idea.

---

# 2. Let's Follow One Real Write

This is the easiest way for me to understand the oplog.

Suppose my application creates an order:

```javascript
db.orders.insertOne({
    customer: "Vivek",
    product: "Laptop",
    amount: 75000
})
```

My application sends the write to the Primary:

```text
My Application
      │
      ▼
   PRIMARY
      │
      ▼
Insert Order
```

Now something important happens.

MongoDB records the operation in the oplog.

So mentally:

```text
My Application
      │
      ▼
   PRIMARY
      │
      ├──────────► Database
      │
      └──────────► Oplog
```

The database now contains the order.

And the oplog contains information about the operation that happened.

---

# 3. Why Record The Operation?

Because the Secondaries need to know what changed.

Imagine my database already contains:

```text
10 million documents
```

Then I insert **one** new document.

I don't want MongoDB to send:

```text
10 million documents
```

to every Secondary.

I only need to communicate:

> "This new operation happened."

So the idea becomes:

```text
10,000,000 existing documents
          +
       1 change
          ↓
       Oplog
          ↓
      Secondary
```

This is much more efficient.

---

# 4. The Oplog Is Basically A Change Log

This is probably the simplest mental model I can use.

Imagine I have a notebook beside my database.

Every time something important changes, I write it down:

```text
1. User was inserted
2. Order was inserted
3. Course was updated
4. Order was deleted
5. User was updated
```

That notebook is basically the idea behind the oplog.

So:

```text
Database
   ↓
Current state


Oplog
   ↓
Recent changes that happened
```

This distinction is REALLY important.

### Database

Tells me:

> **What does my data look like right now?**

### Oplog

Tells me:

> **What operations happened that can be used to reproduce those changes?**

---

# 5. Now Bring The Secondary Into The Picture

Suppose the Primary has recorded:

```text
Oplog

Operation 101
Operation 102
Operation 103
Operation 104
```

The Secondary has already processed:

```text
Operation 101
Operation 102
```

So it knows:

```text
"I've already processed up to 102."
```

It now needs:

```text
103
104
```

So conceptually:

```text
Primary Oplog

101 ✓
102 ✓
103 ← Secondary needs this
104 ← Secondary needs this
```

The Secondary gets the newer operations and applies them to its own copy of the data.

So:

```text
             PRIMARY
                │
                ▼
              OPLOG
                │
          103, 104...
                │
                ▼
           SECONDARY
                │
                ▼
          Apply changes
```

That's replication.

---

# 6. This Is The Part I Want To Remember

I don't want to remember:

> "Secondaries copy the Primary."

That's too vague.

I want to remember:

> **The Secondary follows the Primary's operations and applies those changes to its own data.**

So my mental model becomes:

```text
PRIMARY
   │
   │ 1. Write happens
   ▼
OPLOG
   │
   │ 2. Change is recorded
   ▼
SECONDARY
   │
   │ 3. Gets the operation
   ▼
APPLY CHANGE
   │
   ▼
SECONDARY DATA UPDATED
```

---

# 7. The Secondary Isn't Watching My Node.js App

This confused me initially.

Suppose:

```text
Node.js
   │
   ▼
Primary
```

The Secondary isn't doing this:

```text
Node.js
  ├────► Primary
  ├────► Secondary
  └────► Secondary
```

My application normally sends the write to the Primary.

MongoDB handles replication between its own members.

So there are really two separate flows:

### Application flow

```text
Application
     ↓
Primary
```

### Replication flow

```text
Primary
   ↓
Oplog
   ↓
Secondaries
```

Keeping these two flows separate makes the architecture much easier to understand.

---

# 8. What Does An Oplog Entry Look Like?

If I inspect the oplog, I might see something conceptually similar to:

```javascript
{
    ts: ...,
    op: "i",
    ns: "mydb.users",
    o: {
        name: "Vivek",
        age: 20
    }
}
```

I don't want to memorize this entire object.

I only want to understand what the important fields mean.

---

## `ts` — When Did It Happen?

`ts` represents the timestamp associated with the operation.

I can use it mentally to understand the ordering of operations.

```text
Operation A → timestamp
Operation B → timestamp
Operation C → timestamp
```

---

## `op` — What Happened?

`op` tells me the operation type.

For example:

```text
i → insert
u → update
d → delete
```

So:

```javascript
op: "i"
```

basically tells me:

> "This was an insert operation."

---

## `ns` — Where Did It Happen?

`ns` means namespace.

It tells me which database and collection the operation belongs to.

For example:

```text
mydb.users
```

means:

```text
Database   → mydb
Collection → users
```

---

## `o` — What Data Belongs To The Operation?

`o` contains information related to the operation.

For an insert, it can contain the inserted document.

For updates and other operations, its contents can be different.

So I remember:

> **`o` = operation-specific data.**

I don't need to memorize its exact structure yet.

---

# 9. Why Does The Order Matter?

This is another thing I need to understand.

Imagine these operations:

```text
1. Create account
2. Add money
3. Purchase course
```

They happened in that order.

I can't randomly apply them as:

```text
3 → 1 → 2
```

and expect everything to behave correctly.

So the oplog isn't just:

```text
A bunch of random changes
```

The order of operations matters.

I can visualize it as:

```text
Operation 1
     ↓
Operation 2
     ↓
Operation 3
     ↓
Operation 4
     ↓
Operation 5
```

The Secondary needs to progress through these operations.

---

# 10. This Explains Replication Lag

Now the term **replication lag** finally makes sense.

Suppose the Primary has reached:

```text
Operation 100
```

but the Secondary has only processed:

```text
Operation 95
```

Then:

```text
PRIMARY      → 100
SECONDARY    → 95
```

The Secondary is behind by several operations.

That's replication lag.

Eventually it might catch up:

```text
PRIMARY      → 100
SECONDARY    → 100
```

So replication isn't necessarily instantaneous.

There can be a small gap between:

```text
Primary changes
```

and:

```text
Secondary applies the change
```

---

# 11. Why Does Replication Lag Matter?

This becomes especially important if I'm reading from a Secondary.

Imagine:

```text
Primary
   ↓
User changes profile
```

Immediately after that, I read from a Secondary.

If that Secondary hasn't caught up yet, I might temporarily see the **older version** of the data.

So:

```text
Primary:
name = Vivek

Secondary:
name = Old Name
```

for a short period while replication catches up.

This is one reason I'll eventually need to understand:

> **Read Preference**

Because choosing to read from Secondaries can have consistency implications.

I'll study that separately.

---

# 12. Where Is The Oplog Stored?

The replica-set oplog is stored in:

```text
local.oplog.rs
```

So if I'm connected to a replica-set member, I can inspect it using:

```javascript
use local
```

and:

```javascript
db.oplog.rs.find().limit(10)
```

Now I'm looking at MongoDB's replication log rather than my application data.

This is where the concept becomes much more interesting because I can actually **see the operations**.

---

# 13. Why The Oplog Lives In `local`

The `local` database is special.

It contains information that is specific to that MongoDB instance.

The oplog isn't part of my normal application data like:

```text
myapp.users
myapp.orders
myapp.courses
```

Instead:

```text
local.oplog.rs
```

belongs to MongoDB's internal replica-set operation.

So I shouldn't think:

> "My application created this collection."

MongoDB manages it as part of replication.

---

# 14. The Oplog Is Not A Permanent History

Here's another important detail.

The oplog doesn't keep growing forever.

It is a **capped collection**.

That means it maintains a limited amount of recent history.

Think of it like a rolling window:

```text
OLD                              NEW
 ↓                                ↓
[101][102][103][104][105][106][107]
```

New operations keep coming:

```text
[102][103][104][105][106][107][108]
```

The oldest entries eventually disappear as new ones are added.

So:

> **The oplog is a rolling window of recent operations, not a permanent history of every database operation ever performed.**

---

# 15. Why Does Oplog Size Matter?

Now imagine a Secondary goes offline:

```text
Primary     → Running
Secondary   → Offline
```

While it's offline, the Primary keeps generating operations:

```text
101
102
103
104
105
...
```

When the Secondary comes back, it needs the operations it missed.

If those operations are still available in the oplog:

```text
Secondary
    ↓
"I'm behind."
    ↓
Get missing operations
    ↓
Apply them
    ↓
Catch up
```

Great.

But if it stayed offline for so long that the operations it needs have already disappeared from the oplog:

```text
Needed operation ❌
```

then it can't simply continue from where it stopped.

It may need to be **resynchronized**.

That's why oplog sizing and monitoring matter in real deployments.

---

# 16. One Important Correction To My Mental Model

I don't want to think:

> "The oplog is a backup."

It isn't.

If my database is accidentally deleted, I shouldn't think:

```text
"No problem, oplog will restore everything."
```

That's not what the oplog is designed for.

Its primary purpose in this context is:

> **Supporting replication by recording operations that replica-set members need to apply.**

So:

```text
Backup
   ≠
Oplog
```

They're different things.

---

# 17. One More Thing: Oplog ≠ Database Copy

Another distinction:

```text
Database
```

contains the actual current data.

The oplog contains operations.

For example:

```text
Database:

users
└── Vivek
    age: 20
```

While the oplog might contain something conceptually like:

```text
Insert user Vivek
```

So the oplog isn't simply:

```text
"Here is another copy of my users collection."
```

It's more like:

```text
"Here are the changes that happened."
```

That's the key difference.

---

# 18. Putting Everything Together

Now let's follow one write from beginning to end.

Suppose I run:

```javascript
db.orders.insertOne({
    customer: "Vivek",
    amount: 75000
})
```

### Step 1 — Application sends the write

```text
Application
     ↓
Primary
```

### Step 2 — Primary performs the write

```text
Primary
   ↓
orders collection updated
```

### Step 3 — Operation is recorded

```text
Primary
   ↓
Oplog
```

### Step 4 — Secondary gets the operation

```text
Oplog
   ↓
Secondary
```

### Step 5 — Secondary applies it

```text
Secondary
   ↓
orders collection updated
```

So the whole thing becomes:

```text
             APPLICATION
                  │
                  ▼
               PRIMARY
                  │
          ┌───────┴────────┐
          ▼                ▼
      DATABASE            OPLOG
                             │
                             ▼
                         SECONDARY
                             │
                             ▼
                       APPLY CHANGE
                             │
                             ▼
                       UPDATED DATA
```

That's the picture I want to remember.

---

# 19. Why This Is Better Than "MongoDB Copies Data"

Because now I can explain **what actually happens**.

Bad explanation:

> "MongoDB copies the Primary's data to Secondaries."

Better explanation:

> "MongoDB records operations in the oplog, and Secondaries use those operations to replicate changes onto their own data."

That second explanation is much closer to how I should think about replication internally.

---

# 20. How Oplog And Elections Connect

At first, I thought these were separate topics:

```text
Oplog
```

and:

```text
Elections
```

But they're actually connected.

The replica set needs to know things like:

```text
Which members are alive?
Which members are caught up?
How much replication lag exists?
Which members can participate in an election?
```

So I'm starting to see the bigger system:

```text
                 REPLICA SET
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
        Primary               Secondaries
          │                       │
          ▼                       │
        Oplog ────────────────────┘
          │
          ▼
   Replication Progress
          │
          ▼
      Replica State
          │
          ▼
       Elections
```

These aren't random MongoDB features.

They're all parts of the same replication system.

---

# 21. The Mental Model I Want To Keep

If I forget everything else from this lesson, I want to reconstruct this:

```text
                 PRIMARY
                    │
               Write happens
                    │
                    ▼
                  OPLOG
                    │
              "This changed."
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
      SECONDARY           SECONDARY
          │                   │
     Apply change        Apply change
          │                   │
          ▼                   ▼
       Catches up          Catches up
```

And the simplest sentence:

> **Primary changes the data → oplog records the operation → Secondaries replicate that operation → Secondaries apply the change.**

That's replication in my head now.

---

# Quick Self-Test

Before moving on, I should be able to answer these without looking back.

### What is the oplog?

A rolling record of database operations used by MongoDB replica sets for replication.

### Is the oplog the database itself?

No.

The database stores the current data.

The oplog records operations.

### Is the oplog a backup?

No.

It's primarily part of MongoDB's replication mechanism.

### Where is the oplog?

```text
local.oplog.rs
```

### What does `op: "i"` mean?

Insert.

### What is replication lag?

The delay between a change being made on the Primary and being applied by a Secondary.

### Does the oplog keep everything forever?

No.

It's a capped collection with a rolling window of operations.

### What happens if a Secondary falls too far behind?

If the operations it needs are no longer available in the oplog, it may need to be resynchronized.

---

# What I Understand Now

Before:

```text
Primary
   ↓
"Somehow"
   ↓
Secondary
```

Now:

```text
Primary
   │
   │ Write
   ▼
Database
   │
   └──────► Oplog
                │
                │ Operations
                ▼
           Secondary
                │
                ▼
          Apply Changes
```

That **"somehow"** is no longer a mystery.

The oplog is the missing piece.

---

# What's Still Left To Understand?

Now I know how changes are replicated.

But what happens when this suddenly occurs?

```text
                  PRIMARY
                     ❌
                     │
                  FAILURE

              ┌──────┴──────┐
              ▼             ▼
          SECONDARY     SECONDARY
```

I know an election happens.

But now I want to understand it properly:

* How do the members detect the failure?
* Who can become a candidate?
* Who votes?
* How does majority work?
* How does MongoDB prevent two Primaries?
* How is the new Primary selected?
* What happens to my application during the election?

That's the next part of replication:

```text
Primary Failure
       ↓
Detection
       ↓
Election
       ↓
Voting
       ↓
New Primary
       ↓
Failover
```

And that's where **Replication Elections & Failover** comes next.
