# MongoDB Transactions — Lesson 4

## Read Concern & Write Concern

So far, I understand the basic structure of a MongoDB transaction:

```text
Session
   ↓
Transaction
   ↓
Operations
   ↓
COMMIT / ABORT
```

But now I have two new questions:

> **When my transaction reads something, what kind of data is it allowed to see?**

and:

> **When my transaction writes something, how much confirmation do I want from MongoDB?**

That's where **Read Concern** and **Write Concern** come in.

---

# 1. The Two Questions I Need to Remember

I can understand both concepts by asking two simple questions.

### Read Concern

> **"What consistency guarantee do I want for my reads?"**

### Write Concern

> **"How much acknowledgement do I require for my writes?"**

So:

```text
READ
 ↓
Read Concern
 ↓
"What consistency guarantee does my read have?"


WRITE
 ↓
Write Concern
 ↓
"How much acknowledgement do I require?"
```

This is the foundation of the whole topic.

---

# 2. A Simple Real-World Example

Imagine I am using Amazon.

I check my order:

```text
"Where is my package?"
```

That's a **read**.

I place an order:

```text
"Buy this product."
```

That's a **write**.

Now I can ask:

### While reading:

> "What version/state of the data should I see?"

That's related to **Read Concern**.

### After writing:

> "How much confirmation do I want that MongoDB has acknowledged my write?"

That's related to **Write Concern**.

So:

```text
READ
 ↓
Read Concern

WRITE
 ↓
Write Concern
```

---

# 3. Why Do I Even Need These?

If MongoDB were always running as a single server, this might feel unnecessary.

But MongoDB can use a **Replica Set**.

For example:

```text
                 Replica Set

                   Primary
                  /       \
                 /         \
                ↓           ↓
           Secondary    Secondary
```

The Primary receives writes and the data is replicated to the Secondary members.

Now new questions appear:

```text
"Which version of the data should I read?"
```

and:

```text
"How many members should acknowledge my write?"
```

These are different problems.

```text
READ
 ↓
Which data/consistency level should I see?
 ↓
Read Concern


WRITE
 ↓
How much acknowledgement should I require?
 ↓
Write Concern
```

---

# 4. Read Concern

Read Concern controls the **consistency and visibility guarantees of data being read**.

Think:

```text
Database
    ↓
Different states of data
    ↓
Read Concern
    ↓
What consistency guarantee does my read have?
```

So I should remember:

> **Read Concern is about the consistency guarantee of my reads.**

---

# 5. Important Read Concern Levels

MongoDB provides several Read Concern levels:

```text
local
available
majority
linearizable
snapshot
```

I don't need to memorize every technical detail yet.

For my current understanding, I mainly want to understand:

```text
local
majority
snapshot
```

---

# 6. `local`

Think:

> **"Give me data that is locally available on the member."**

Conceptually:

```text
MongoDB Member
      ↓
What data do you currently have?
      ↓
Read it
```

Example:

```javascript
db.products.find(
    {
        _id: 1
    },
    {
        readConcern: {
            level: "local"
        }
    }
);
```

My memory:

```text
local
  ↓
Locally available data
```

It does not require the data to be majority committed.

---

# 7. `majority`

Now I want a stronger consistency guarantee.

Think:

> **"I want to read data that has been majority committed."**

Suppose I have:

```text
Primary       ✓
Secondary     ✓
Secondary     ✗
```

With three voting members:

```text
2 / 3
```

is a majority.

So:

```text
majority
    ↓
Majority committed data
```

Example:

```javascript
db.products.find(
    {
        _id: 1
    },
    {
        readConcern: {
            level: "majority"
        }
    }
);
```

My memory:

```text
majority
    ↓
Read majority-committed data
```

---

# 8. `snapshot`

This is especially important when I am learning transactions.

Think:

> **"Give my transaction a consistent snapshot of the data."**

Conceptually:

```text
Transaction starts
       ↓
Consistent snapshot
       ↓
Transaction performs reads
       ↓
Reads use that snapshot
```

Example:

```javascript
const session = db.getMongo().startSession();

session.startTransaction({
    readConcern: {
        level: "snapshot"
    }
});
```

My mental model:

```text
Transaction
     ↓
Snapshot
     ↓
Consistent view
```

I should remember:

> **`snapshot` is especially important when thinking about consistent reads inside transactions.**

---

# 9. Read Concern Summary

For now, I can remember the important levels like this:

```text
local
 ↓
Locally available data


majority
 ↓
Majority-committed data


snapshot
 ↓
Consistent transaction snapshot
```

I don't need to memorize every edge case yet.

The important thing is understanding the problem each level is solving.

---

# 10. Now Write Concern

Let's switch from reading to writing.

Suppose I execute:

```javascript
db.users.insertOne({
    name: "Vivek"
});
```

MongoDB receives my write.

But I can ask:

> **"How much confirmation do I want before MongoDB tells me the write has been acknowledged?"**

That's Write Concern.

Think:

```text
Application
     ↓
   WRITE
     ↓
  MongoDB
     ↓
Write Concern
     ↓
How much acknowledgement?
```

So:

> **Write Concern defines the acknowledgement requirements for my write.**

---

# 11. The Main Write Concern Parameters

The important parameters I am learning are:

```text
w
j
wtimeout
```

Think of them like this:

```text
                    WRITE CONCERN
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
          w              j          wtimeout
          │              │              │
          ↓              ↓              ↓
   How many members?   Journal?    How long to wait?
```

---

# 12. The `w` Parameter

The `w` option controls the required level of acknowledgement.

For example:

```javascript
db.users.insertOne(
    {
        name: "Vivek"
    },
    {
        writeConcern: {
            w: 1
        }
    }
);
```

Think:

```text
w: 1
  ↓
Wait for acknowledgement from one member
```

For a normal replica-set write, this means acknowledgement from the **Primary**.

Conceptually:

```text
Application
     ↓
   Write
     ↓
Primary
     ↓
ACK ✓
```

My memory:

> **`w` = How many members need to acknowledge the write?**

---

# 13. `w: 1`

This is the common basic form.

```javascript
db.users.insertOne(
    {
        name: "Vivek"
    },
    {
        writeConcern: {
            w: 1
        }
    }
);
```

Think:

```text
w: 1
 ↓
Wait for one acknowledgement
 ↓
Primary acknowledges
 ↓
Return success
```

So:

```text
w: 1
 ↓
Primary acknowledgement
```

---

# 14. `w: "majority"`

Now I want acknowledgement from a majority of the voting members.

Example:

```javascript
db.users.insertOne(
    {
        name: "Vivek"
    },
    {
        writeConcern: {
            w: "majority"
        }
    }
);
```

Suppose my replica set has:

```text
Primary       ✓
Secondary     ✓
Secondary     ✗
```

Then:

```text
2 / 3
```

is a majority.

So:

```text
w: "majority"
       ↓
Wait for majority acknowledgement
```

My memory:

> **`w: "majority"` does NOT mean every server. It means a majority of the voting members.**

---

# 15. `w: 0`

Now I have another option:

```javascript
db.users.insertOne(
    {
        name: "Vivek"
    },
    {
        writeConcern: {
            w: 0
        }
    }
);
```

Think:

```text
w: 0
 ↓
Do not wait for write acknowledgement
```

So:

```text
Application
     ↓
   WRITE
     ↓
MongoDB
     ↓
Don't wait for acknowledgement
```

This is called an **unacknowledged write**.

The important memory point is:

> **`w: 0` means the client does not wait for acknowledgement of the write.**

I should NOT memorize it as:

> "MongoDB definitely returns success before the write happens."

That's too simplistic.

The correct mental model is:

```text
w: 0
 ↓
No write acknowledgement is requested
```

---

# 16. Comparing `w`

Now the three values become easy:

```text
w: 0
 ↓
Don't wait for acknowledgement


w: 1
 ↓
Wait for one acknowledgement


w: "majority"
 ↓
Wait for majority acknowledgement
```

So:

```text
             w
             │
      ┌──────┼─────────┐
      ↓      ↓         ↓
      0      1      "majority"
      │      │         │
      ↓      ↓         ↓
   Don't   Primary   Majority
   wait    ACK       ACK
```

---

# 17. The `j` Parameter

Now I have:

```text
j
```

`j` is related to MongoDB's **journal**.

Think of the journal as a durable record of database changes.

The simple mental model is:

```text
Write
  ↓
Journal
  ↓
Acknowledgement
```

Example:

```javascript
db.users.insertOne(
    {
        name: "Vivek"
    },
    {
        writeConcern: {
            w: 1,
            j: true
        }
    }
);
```

Here:

```text
w: 1
 ↓
Wait for primary acknowledgement

j: true
 ↓
Require journal acknowledgement
```

So my memory is:

> **`j: true` = wait for the write to be written to the journal before acknowledgement.**

I don't need to understand the storage engine internals yet.

Just remember:

```text
j
 ↓
Journal
```

---

# 18. The `wtimeout` Parameter

Now imagine I use:

```javascript
w: "majority"
```

MongoDB may need to wait for other replica-set members.

Suppose one Secondary is very slow:

```text
Primary       ✓
Secondary     ✓
Secondary     ...
                  ↓
               Very slow
```

Without a timeout, I may have to keep waiting for the requested acknowledgement.

That's where:

```text
wtimeout
```

comes in.

Think:

> **"How long should MongoDB wait for the requested write concern?"**

---

# 19. `wtimeout: 5000`

For example:

```javascript
db.users.insertOne(
    {
        name: "Vivek"
    },
    {
        writeConcern: {
            w: "majority",
            wtimeout: 5000
        }
    }
);
```

Now I can read this as:

```text
w: "majority"
        ↓
Wait for majority acknowledgement

wtimeout: 5000
        ↓
Wait up to 5000 milliseconds
```

Since:

```text
5000 milliseconds = 5 seconds
```

I can think:

```text
Write
  ↓
Wait for majority
  ↓
Maximum wait = 5 seconds
```

If the requested acknowledgement isn't achieved within that period, MongoDB can return a **write concern error**.

Important:

> **A `wtimeout` does not automatically roll back the write.**

The write may already have succeeded on the Primary even though the required acknowledgement was not received in time.

---

# 20. Complete Write Concern Example

Now the instructor's example makes complete sense:

```javascript
db.users.insertOne(
    {
        name: "Manas"
    },
    {
        writeConcern: {
            w: "majority",
            wtimeout: 5000
        }
    }
);
```

Read it from top to bottom:

```text
insertOne()
    ↓
Write the document
    ↓
w: "majority"
    ↓
Wait for majority acknowledgement
    ↓
wtimeout: 5000
    ↓
Don't wait longer than 5 seconds
```

This is much easier than memorizing the syntax blindly.

---

# 21. Combining `w` and `j`

Write Concern options can be combined.

For example:

```javascript
db.users.insertOne(
    {
        name: "Manas"
    },
    {
        writeConcern: {
            w: "majority",
            j: true
        }
    }
);
```

My mental model:

```text
w: "majority"
       ↓
Majority acknowledgement

j: true
       ↓
Journal acknowledgement
```

I should remember what each option controls separately.

---

# 22. Read Concern vs Write Concern

This is the comparison I want permanently in my memory:

|                   | Read Concern                                  | Write Concern                          |
| ----------------- | --------------------------------------------- | -------------------------------------- |
| Main question     | What consistency guarantee does my read have? | How much acknowledgement do I require? |
| Applies to        | Reads                                         | Writes                                 |
| Main idea         | Read consistency / visibility                 | Write acknowledgement                  |
| Important options | `local`, `majority`, `snapshot`               | `w`, `j`, `wtimeout`                   |
| Memory trick      | "What am I seeing?"                           | "How much acknowledgement do I need?"  |

So:

```text
READ
 ↓
Read Concern
 ↓
"What consistency guarantee does my read have?"


WRITE
 ↓
Write Concern
 ↓
"How much acknowledgement do I require?"
```

---

# 23. Now Bring Transactions Into the Picture

This is where the concepts connect.

A transaction can have:

```text
Transaction
     │
     ├── Read Concern
     │
     └── Write Concern
```

For example:

```javascript
const session = db.getMongo().startSession();

session.startTransaction({
    readConcern: {
        level: "snapshot"
    },

    writeConcern: {
        w: "majority"
    }
});
```

Now I can read this as:

```text
Start Transaction
       ↓
Read using snapshot consistency
       ↓
Perform operations
       ↓
Require majority write acknowledgement
       ↓
Commit
```

---

# 24. Complete Transaction Example

Let's use my Bank example.

```javascript
use("Bank");
```

Suppose I have:

```javascript
db.accounts.insertMany([
    {
        _id: 1,
        name: "Vivek",
        balance: 5000
    },

    {
        _id: 2,
        name: "Abhishek",
        balance: 2000
    }
]);
```

Now I want to transfer ₹1000.

```javascript
const session = db.getMongo().startSession();

try {

    session.startTransaction({
        readConcern: {
            level: "snapshot"
        },

        writeConcern: {
            w: "majority"
        }
    });

    const accounts = session
        .getDatabase("Bank")
        .accounts;

    /*
     * Read both accounts.
     * The transaction uses the configured
     * read concern for its reads.
     */

    const vivek = accounts.findOne({
        _id: 1
    });

    const abhishek = accounts.findOne({
        _id: 2
    });

    /*
     * Transfer ₹1000 from Vivek
     * to Abhishek.
     */

    accounts.updateOne(
        {
            _id: 1
        },
        {
            $inc: {
                balance: -1000
            }
        }
    );

    accounts.updateOne(
        {
            _id: 2
        },
        {
            $inc: {
                balance: 1000
            }
        }
    );

    /*
     * If everything succeeds,
     * commit the transaction.
     */

    session.commitTransaction();

} catch (error) {

    /*
     * If something goes wrong,
     * abort the transaction.
     */

    session.abortTransaction();

} finally {

    /*
     * End the session when
     * the transaction is finished.
     */

    session.endSession();

}
```

Now the whole flow is:

```text
SESSION
   ↓
TRANSACTION
   ↓
snapshot Read Concern
   ↓
Consistent transaction reads
   ↓
WRITE OPERATIONS
   ↓
majority Write Concern
   ↓
Majority acknowledgement requirement
   ↓
COMMIT
```

---

# 25. Important Transaction Rule

There is one thing I need to keep in mind:

For a **multi-document transaction**, I configure the transaction's Write Concern rather than trying to give each individual write operation its own Write Concern.

So I prefer:

```javascript
session.startTransaction({
    writeConcern: {
        w: "majority"
    }
});
```

instead of trying to do:

```javascript
accounts.updateOne(
    { _id: 1 },
    { $inc: { balance: -1000 } },
    {
        writeConcern: {
            w: "majority"
        }
    }
);
```

The transaction controls the write concern for the transaction.

Also, `w: 0` is not something I should use for a multi-document transaction. Transactions require acknowledged writes.

---

# 26. Transaction vs Read Concern vs Write Concern

I should NOT think:

```text
Read Concern = Transaction
Write Concern = Transaction
```

Instead:

```text
                    TRANSACTION
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
       Groups          READ           WRITE
      operations         │               │
      together           ↓               ↓
                  Read Concern      Write Concern
                        ↓               ↓
                 Read consistency   Acknowledgement
```

Each solves a different problem.

---

# 27. The Three Questions

This is the most important part of the lesson.

### Transaction

> **"Which operations belong together?"**

### Read Concern

> **"What consistency guarantee do my reads have?"**

### Write Concern

> **"How much acknowledgement do my writes require?"**

So:

```text
TRANSACTION
     ↓
"These operations belong together."


READ CONCERN
     ↓
"What consistency guarantee do my reads have?"


WRITE CONCERN
     ↓
"How much acknowledgement do my writes require?"
```

---

# 28. Write Concern Memory Map

I want to remember the Write Concern parameters like this:

```text
                     WRITE CONCERN
                          │
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
          w               j            wtimeout
          │               │                │
          ↓               ↓                ↓
   Acknowledgement      Journal       Maximum wait
       level
          │
     ┌────┼───────────────┐
     ↓    ↓               ↓
    0     1          "majority"
     │    │               │
     ↓    ↓               ↓
   Don't Primary       Majority
   wait   ACK             ACK
```

This is the mental picture I want in my head.

---

# 29. Quick Code Reference

## `w: 0`

```javascript
db.users.insertOne(
    {
        name: "Vivek"
    },
    {
        writeConcern: {
            w: 0
        }
    }
);
```

```text
Don't wait for acknowledgement
```

---

## `w: 1`

```javascript
db.users.insertOne(
    {
        name: "Vivek"
    },
    {
        writeConcern: {
            w: 1
        }
    }
);
```

```text
Wait for primary acknowledgement
```

---

## `w: "majority"`

```javascript
db.users.insertOne(
    {
        name: "Vivek"
    },
    {
        writeConcern: {
            w: "majority"
        }
    }
);
```

```text
Wait for majority acknowledgement
```

---

## `j: true`

```javascript
db.users.insertOne(
    {
        name: "Vivek"
    },
    {
        writeConcern: {
            w: 1,
            j: true
        }
    }
);
```

```text
Require journal acknowledgement
```

---

## `wtimeout`

```javascript
db.users.insertOne(
    {
        name: "Vivek"
    },
    {
        writeConcern: {
            w: "majority",
            wtimeout: 5000
        }
    }
);
```

```text
Wait for majority
     ↓
Maximum wait = 5 seconds
```

---

# 30. The Most Important Correction in My Thinking

I should avoid saying:

> "Read Concern tells me how much I trust the data."

That's a useful beginner shortcut, but the technically better understanding is:

> **Read Concern defines the consistency/visibility guarantees of my reads.**

Similarly, I should avoid saying:

> "Write Concern guarantees my data can never be lost."

A better understanding is:

> **Write Concern defines the acknowledgement requirements for my writes.**

These small distinctions will become important when I learn more about replica sets, failover, and durability.

---

# 31. What I Should Know From This Lesson

At the end of this lesson, I should know:

```text
READ CONCERN

local
majority
snapshot
```

And:

```text
WRITE CONCERN

w
j
wtimeout
```

Specifically:

```text
w: 0
    ↓
No acknowledgement requested


w: 1
    ↓
Primary acknowledgement


w: "majority"
    ↓
Majority acknowledgement


j: true
    ↓
Journal acknowledgement


wtimeout: 5000
    ↓
Maximum wait of 5 seconds
```

---

# 32. Self-Test

Before moving to the next lesson, I should be able to answer these without looking at my notes.

### Read Concern

**1. What problem does Read Concern solve?**

**2. What does `local` mean?**

**3. What does `majority` mean as a Read Concern?**

**4. Why is `snapshot` important for transactions?**

### Write Concern

**5. What problem does Write Concern solve?**

**6. What does `w` control?**

**7. What does `w: 0` mean?**

**8. What does `w: 1` mean?**

**9. What does `w: "majority"` mean?**

**10. What does `j: true` mean?**

**11. What does `wtimeout` control?**

**12. What happens if `wtimeout` is reached?**

**13. Does `wtimeout` automatically roll back the write?**

### Transactions

**14. Where can I configure Read Concern in a transaction?**

```javascript
session.startTransaction({
    readConcern: {
        level: "snapshot"
    }
});
```

**15. Where can I configure Write Concern?**

```javascript
session.startTransaction({
    writeConcern: {
        w: "majority"
    }
});
```

**16. Can I use `w: 0` for a multi-document transaction?**

I should know that transactions require acknowledged writes, so `w: 0` is not appropriate for them.

---

# 33. Final Mental Model

I want these three questions permanently connected:

```text
                    TRANSACTION
                         ↓
              "What belongs together?"
                         │
                         │
             ┌───────────┴───────────┐
             ↓                       ↓
       READ CONCERN             WRITE CONCERN
             ↓                       ↓
      "What consistency        "How much
       guarantee do my          acknowledgement
       reads have?"             do I require?"
```

And inside Write Concern:

```text
w
↓
How many members acknowledge?


j
↓
Journal acknowledgement?


wtimeout
↓
How long should I wait?
```

---

# One-Line Memory

> **Transaction = what belongs together. Read Concern = what consistency guarantee my reads have. Write Concern = how much acknowledgement my writes require.**

---

# Next Lesson

Now I understand how MongoDB controls:

```text
Transaction
     ↓
Read Concern
     ↓
Write Concern
```

But there is still a big question.

What happens when two transactions run at almost the exact same time?

For example:

```text
Transaction A
     ↓
Reads Product
     ↓
Stock = 1


Transaction B
     ↓
Reads Product
     ↓
Stock = 1
```

Both transactions think the product is available.

Now what happens?

Can both modify the same document?

Can one transaction see another transaction's uncommitted changes?

What happens when two transactions try to modify the same document?

What happens when MongoDB detects a conflict?

This leads to:

# Lesson 5 — Transaction Isolation & Concurrency

This is where transactions become much more interesting because now I am dealing with **multiple transactions happening at the same time**.
