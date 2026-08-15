/*
    MongoDB Replication — Oplog Playground

    Goal:
    I am not trying to memorize oplog fields here.

    I just want to SEE:
        1. A normal database operation
        2. The corresponding oplog entry
        3. What the important oplog fields mean

    This playground should be run against a MongoDB Replica Set.
*/


// ============================================================
// 1. Check Whether I Am Connected To A Replica Set
// ============================================================

db.adminCommand({ replSetGetStatus: 1 })

/*
    If this works, I am connected to a Replica Set.

    If MongoDB says something like:

        not running with --replSet

    then I am probably connected to a standalone MongoDB server.

    In that case, the oplog playground will not work.
*/


// ============================================================
// 2. Look At The Oplog
// ============================================================

use("local")

db.oplog.rs.find().limit(10)

/*
    This is the first thing I want to notice.

    I am NOT looking at:

        myDatabase.users
        myDatabase.orders

    I am looking at:

        local.oplog.rs

    This is MongoDB's replication log.
*/


// ============================================================
// 3. Look At Only The Important Oplog Fields
// ============================================================

db.oplog.rs.find(
    {},
    {
        ts: 1,
        op: 1,
        ns: 1,
        o: 1
    }
).limit(10)

/*
    Now the output should be easier to understand.

    ts → timestamp / position information
    op → type of operation
    ns → database + collection
    o  → operation-specific data

    Common operation values:

        i → insert
        u → update
        d → delete
*/


// ============================================================
// 4. Create A Test Database
// ============================================================

use("replicationPlayground")

db.createCollection("users")

/*
    I am creating a separate database so I don't accidentally
    experiment with important application data.
*/


// ============================================================
// 5. Insert A Document
// ============================================================

db.users.insertOne({
    name: "Vivek",
    age: 20,
    course: "BTech CSE"
})

/*
    Something important just happened.

    I performed a normal MongoDB operation:

        INSERT

    Now MongoDB should have recorded that operation
    in the oplog.

    Let's go and look for it.
*/


// ============================================================
// 6. Find My Insert In The Oplog
// ============================================================

use("local")

db.oplog.rs.find({
    ns: "replicationPlayground.users",
    op: "i"
}).sort({
    $natural: -1
}).limit(5)

/*
    Now I should be able to find the insert operation.

    This is the moment where the concept becomes real:

        I inserted a document
                ↓
        MongoDB recorded the operation
                ↓
        The operation appears in the oplog
*/


// ============================================================
// 7. Inspect The Latest Operation More Clearly
// ============================================================

db.oplog.rs.find({
    ns: "replicationPlayground.users"
}).sort({
    $natural: -1
}).limit(1)

/*
    Look carefully at:

        ts
        op
        ns
        o

    I should NOT try to memorize the entire object.

    I just want to connect it to what I did earlier.
*/


// ============================================================
// 8. Perform An Update
// ============================================================

use("replicationPlayground")

db.users.updateOne(
    { name: "Vivek" },
    {
        $set: {
            age: 21
        }
    }
)

/*
    I just performed an UPDATE.

    Now let's see what MongoDB recorded.
*/


// ============================================================
// 9. Find The Update In The Oplog
// ============================================================

use("local")

db.oplog.rs.find({
    ns: "replicationPlayground.users",
    op: "u"
}).sort({
    $natural: -1
}).limit(5)

/*
    Notice:

        op: "u"

    means this is an update operation.

    So now I have personally seen:

        i → insert
        u → update
*/


// ============================================================
// 10. Perform A Delete
// ============================================================

use("replicationPlayground")

db.users.deleteOne({
    name: "Vivek"
})

/*
    One more operation.

    This time:

        DELETE
*/


// ============================================================
// 11. Find The Delete In The Oplog
// ============================================================

use("local")

db.oplog.rs.find({
    ns: "replicationPlayground.users",
    op: "d"
}).sort({
    $natural: -1
}).limit(5)

/*
    Now I have seen:

        i → insert
        u → update
        d → delete

    These are three of the most important operation types
    for understanding the basic oplog.
*/


// ============================================================
// 12. Look At My Recent Operations Together
// ============================================================

db.oplog.rs.find({
    ns: "replicationPlayground.users"
}).sort({
    $natural: -1
}).limit(10)

/*
    This is probably the most useful command in this file.

    I can now see the recent operations belonging to
    my test collection.

    The mental model:

        INSERT
           ↓
        OPLOG

        UPDATE
           ↓
        OPLOG

        DELETE
           ↓
        OPLOG
*/


// ============================================================
// 13. Check The Oplog Collection Information
// ============================================================

db.oplog.rs.stats()

/*
    This lets me inspect information about the oplog itself.

    I can see things such as:

        size
        storage information
        document count
        capped collection information

    I don't need to memorize all of this.

    I just want to remember:

        The oplog is a capped collection.
*/


// ============================================================
// 14. See The Latest Oplog Entry
// ============================================================

db.oplog.rs.find().sort({
    $natural: -1
}).limit(1)

/*
    This is a nice command to remember.

    If I simply want to see a recent oplog operation,
    this gives me the latest entry.
*/


// ============================================================
// 15. My Final Mental Model
// ============================================================

/*

    I want this picture in my head:

                     PRIMARY
                        │
                   Write happens
                        │
                        ▼
                      OPLOG
                        │
                  Operation recorded
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
          SECONDARY           SECONDARY
              │                   │
         Apply operation     Apply operation
              │                   │
              ▼                   ▼
          Data updated       Data updated


    So replication is NOT:

        "Copy the entire database."

    My mental model is:

        Primary changes data
                ↓
        Oplog records operation
                ↓
        Secondary gets operation
                ↓
        Secondary applies operation
                ↓
        Secondary catches up
*/


// ============================================================
// IMPORTANT
// ============================================================

/*
    This playground is for LEARNING.

    I am intentionally keeping the operations simple.

    I should NOT modify:

        local.oplog.rs

    manually.

    MongoDB manages the oplog itself.

    My job here is simply to:

        CREATE operations
            ↓
        OBSERVE the oplog
            ↓
        CONNECT the two concepts
*/