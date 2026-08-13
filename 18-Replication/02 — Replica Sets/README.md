# Replica Sets — Primary & Secondary

## What I Know So Far

In the previous lesson, I understood **why replication exists**.

If my entire application depends on one MongoDB server:

```text
My Application
      ↓
MongoDB
      ↓
One Server
```

then that server becomes a **single point of failure**.

If it goes down, my application loses access to its database.

So I came to the idea of having multiple MongoDB servers that keep copies of the same data.

That's where the **Replica Set** comes in.

---

# So What Exactly Is A Replica Set?

The easiest way I understand it is:

> A Replica Set is a group of MongoDB instances that work together and maintain the same dataset.

For example:

```text
                  Replica Set

        ┌────────────┼────────────┐
        ▼            ▼            ▼
     Primary      Secondary    Secondary
```

These aren't three completely independent databases.

They're members of **one MongoDB replication system**.

The whole point is that if something happens to one member, the others can help keep the database available.

---

# But What Is A MongoDB Instance?

Before going further, I need to understand what "member" actually means.

A MongoDB instance is basically a running `mongod` process.

So I can imagine:

```text
Server 1
   └── mongod

Server 2
   └── mongod

Server 3
   └── mongod
```

These instances can be configured to form:

```text
Replica Set
```

In a real production deployment, I'd normally want these members distributed across different machines or failure domains.

Otherwise, if all three are sitting on the same machine and that machine dies, having three processes doesn't really solve my availability problem.

---

# The First Big Question

If I have three MongoDB members:

```text
MongoDB A
MongoDB B
MongoDB C
```

which one should my application write to?

I can't just randomly send writes to all three.

I need some kind of leader.

MongoDB solves this using the **Primary**.

So my replica set becomes:

```text
                 Replica Set

                    PRIMARY
                       │
              ┌────────┴────────┐
              ▼                 ▼
          SECONDARY         SECONDARY
```

Now the architecture makes much more sense.

---

# What Is The Primary?

The Primary is the member that normally accepts write operations.

So if my Node.js application does:

```javascript
db.orders.insertOne({
    customer: "Vivek",
    amount: 5000
})
```

the normal flow is:

```text
Node.js
   ↓
Primary
   ↓
Write
```

The Primary is therefore the main entry point for writes in the replica set. MongoDB's documentation describes the Primary as the only member in the replica set that accepts writes.

---

# Then What Is A Secondary?

A Secondary maintains a copy of the Primary's dataset.

So after the Primary receives a change:

```text
                 PRIMARY
                    │
                New Write
                    │
             ┌──────┴──────┐
             ▼             ▼
         SECONDARY     SECONDARY
```

The Secondaries replicate the Primary's changes and apply them to their own data.

This is what gives me multiple copies of my data inside the replica set.

---

# My First Wrong Mental Model

At first, I thought:

```text
Primary
   ↓
Secondary
   ↓
"Backup Server"
```

But that's not really how I should think about a Secondary.

A Secondary is an **active member of the replica set**.

It:

* maintains replicated data
* participates in replica-set elections
* can potentially become the Primary
* can be configured to serve reads

So instead of thinking:

> "Secondary = backup"

I want to think:

> **"Secondary = another active member of my replica set that maintains a copy of the data."**

That distinction is important.

---

# Primary Is A Role, Not A Permanent Server

This was another thing that clicked for me.

Suppose:

```text
Server A → Primary
Server B → Secondary
Server C → Secondary
```

It would be wrong to think:

> "Server A is permanently the Primary."

No.

**Primary is a role.**

If Server A becomes unavailable:

```text
Server A ❌

Server B → ?
Server C → ?
```

the remaining eligible members can participate in an election.

Eventually I could have:

```text
Server A → ❌
Server B → Primary
Server C → Secondary
```

MongoDB's replica-set design allows a Secondary to become Primary after an election if the current Primary becomes unavailable.

So the important sentence for me is:

> **Primary is not a permanent identity. It is a role currently held by one member.**

---

# Why Does MongoDB Need An Election?

Now imagine the Primary suddenly disappears:

```text
                 PRIMARY ❌
```

I still have:

```text
              SECONDARY
              SECONDARY
```

But MongoDB can't just let both of them decide:

> "I'm the new Primary."

There needs to be a controlled way of deciding who becomes Primary.

That's what an **election** is for.

The simplified idea is:

```text
Primary fails
     ↓
Remaining members communicate
     ↓
Election
     ↓
Eligible member becomes Primary
```

So if:

```text
A → Primary
B → Secondary
C → Secondary
```

and A fails:

```text
A ❌

B ──┐
    ├── Election
C ──┘
    ↓
B → Primary
C → Secondary
```

The exact election rules are more complicated than this, but I don't need all of those details yet.

I just need to understand **why elections exist**.

---

# Why Do Votes Matter?

This is where I started understanding why MongoDB talks about **voting members**.

Imagine I have:

```text
A
B
C
```

and all three can vote.

If A fails:

```text
B
C
```

B and C can reach a majority decision.

With three voting members:

```text
Majority = 2
```

So two members are enough to establish a majority.

The important idea is:

> **MongoDB uses voting and majority rules so the replica set can make decisions safely.**

I don't need to memorize election algorithms right now.

---

# Why Three Members Makes So Much Sense

This is why I keep seeing this architecture:

```text
             Replica Set

             PRIMARY
             /      \
            /        \
     SECONDARY     SECONDARY
```

There are three data-bearing members.

If the Primary fails:

```text
PRIMARY ❌

SECONDARY
SECONDARY
```

I still have two members.

They can establish a majority and elect a new Primary.

MongoDB recommends a three-member replica set with three data-bearing members as the standard minimum configuration for getting the benefits of a replica set.

---

# Why Not Just Two Members?

Suppose I have:

```text
A → Primary
B → Secondary
```

Now A crashes.

Only B remains.

There are two voting members in total, but B alone is:

```text
1 / 2
```

That's not a majority.

So B cannot simply say:

> "I'm definitely the new Primary."

This is one reason having an odd number of voting members is useful.

For example:

```text
3 voting members → majority is 2

5 voting members → majority is 3

7 voting members → majority is 4
```

I don't need to memorize the numbers.

I just remember:

> **Majority means more than half of the voting members.**

---

# A Real-World Example That Makes This Click

Imagine a platform like **Udemy**.

Thousands or millions of users could be browsing courses, logging in, purchasing courses, and accessing their learning data.

I wouldn't want the entire backend to depend on one MongoDB server:

```text
Udemy Backend
      ↓
MongoDB Server
      ↓
      💀
```

Instead, I could have a replica-set architecture:

```text
                 Backend
                    │
                    ▼
                PRIMARY
               /       \
              ▼         ▼
         SECONDARY   SECONDARY
```

If the Primary suddenly becomes unavailable, an eligible Secondary can become the new Primary after an election.

The important thing isn't that "Udemy definitely uses exactly this architecture."

The point is:

> **A large application cannot casually assume that one database server will stay healthy forever.**

That's why the replica-set idea matters in real backend engineering.

---

# What Happens When I Write Data?

Let's put the pieces together.

Suppose I create an order:

```javascript
db.orders.insertOne({
    customer: "Vivek",
    product: "Laptop",
    amount: 75000
})
```

My mental model should be:

```text
                 Node.js
                    │
                    ▼
                 Primary
                    │
                 Write
                    │
                    ▼
               Data Change
                    │
             Replication
              ┌─────┴─────┐
              ▼           ▼
          Secondary    Secondary
```

The important thing here is:

> **My application writes to the Primary; the Secondaries don't independently invent their own version of the data.**

They replicate the Primary's changes.

---

# What Happens When I Read Data?

Here's something I shouldn't assume:

> "All reads always go to the Primary."

That's not necessarily true.

MongoDB has **Read Preference**, which lets me control where reads can be directed.

For example, the normal/default behavior is to read from the Primary.

But I can configure an application to use Secondary members for certain reads.

Conceptually:

```text
Read Preference: primary

Node.js
   ↓
Primary
```

or:

```text
Read Preference: secondary

Node.js
   ↓
Secondary
```

I'll learn Read Preference properly later.

For now, I just want to know that **write routing and read routing are separate concepts**.

---

# One Important Thing About Secondaries

A Secondary can serve reads if configured to do so, but that doesn't mean its data is necessarily identical to the Primary at the exact same instant.

Why?

Because replication happens asynchronously.

There can be a small delay between:

```text
Primary receives change
```

and:

```text
Secondary applies change
```

That delay is called **replication lag**.

I don't need to dive into replication lag yet.

That's coming when I learn how the oplog actually works.

---

# What About An Arbiter?

While learning replica sets, I might come across this:

```text
Primary
Secondary
Arbiter
```

An **arbiter** participates in elections but doesn't store a copy of the data.

So:

```text
Primary      → Data
Secondary    → Data
Arbiter      → Votes, but no data
```

This is useful to know because it prevents me from thinking:

> "Every replica-set member must contain a copy of the database."

That's not true.

An arbiter is specifically an election participant without a data copy.

For my learning, though, I'm going to focus on the normal:

```text
Primary
Secondary
Secondary
```

architecture first.

---

# The Most Important Distinction From This Lesson

I want these four things completely separate in my head.

### Replica Set

The **whole group**.

```text
Primary + Secondaries
```

### Primary

The member currently responsible for writes.

```text
Primary
   ↓
Writes
```

### Secondary

A member that maintains a replicated copy of the data.

```text
Secondary
   ↓
Replicated Data
```

### Election

The process used to choose a new Primary when necessary.

```text
Primary fails
     ↓
Election
     ↓
New Primary
```

That's the architecture.

---

# My Mental Model Now

Before this lesson, I was thinking:

```text
MongoDB
   ↓
Database Server
```

Now I'm thinking:

```text
                    Replica Set
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       PRIMARY        SECONDARY      SECONDARY
          │              │              │
          │              │              │
        Writes        Data Copy       Data Copy
          │
          └──────────────┬──────────────┘
                         │
                    Work Together
                         │
                    High Availability
```

And if the Primary disappears:

```text
PRIMARY ❌
    ↓
Election
    ↓
SECONDARY
    ↓
NEW PRIMARY
```

Now the architecture finally makes sense to me.

---

# But Something Is Still Missing

I know **who** the members are.

I know:

```text
Primary
Secondary
Secondary
```

I know that the Primary handles writes.

I know the Secondaries maintain copies.

But I still don't know **how the copying actually happens**.

For example, suppose I run:

```javascript
db.orders.insertOne({
    customer: "Vivek",
    amount: 5000
})
```

What exactly tells the Secondary:

> "Hey, a new order was inserted."

That's the part I haven't learned yet.

And this is where the **oplog** comes in.

---

# What's Coming Next?

The next lesson is where replication becomes much more interesting.

I'll follow one write all the way through:

```text
Application
     ↓
Primary
     ↓
Write
     ↓
Oplog
     ↓
Secondary reads the oplog
     ↓
Secondary applies the operation
```

Once I understand that flow, I won't think of replication as:

> "MongoDB somehow copies the data."

I'll understand **what MongoDB is actually doing**.

---

# Quick Self-Test

Before moving on, I should be able to answer these myself.

### What is a Replica Set?

A group of MongoDB instances that work together and maintain the same dataset.

### What is the Primary?

The member that normally accepts writes.

### What is a Secondary?

A member that maintains a replicated copy of the Primary's dataset.

### Is the Primary permanent?

No.

The Primary is a role. Another eligible member can become Primary after an election.

### Why do elections exist?

So the replica set can choose a new Primary when the current one becomes unavailable.

### Why are voting members important?

They allow the replica set to make decisions using majority rules.

### Does every member have to store data?

No. An arbiter can vote in elections without storing the dataset.

---

# The One Thing I Want To Remember

If I had to explain this entire lesson to myself in one sentence:

> **A Replica Set is a team of MongoDB instances where one member normally acts as Primary, the others maintain replicated copies as Secondaries, and the group can elect a new Primary if the current one fails.**

So my mental picture is now:

```text
                  REPLICA SET

                    PRIMARY
                       │
                     Writes
                       │
              ┌────────┴────────┐
              ▼                 ▼
          SECONDARY         SECONDARY
              │                 │
              └────────┬────────┘
                       │
                  Replicated Data

               Primary fails
                       ↓
                   Election
                       ↓
                New Primary
```

Now I know **the players**.

Next, I need to understand **how they actually synchronize**.

That's where the **Oplog** comes in.
