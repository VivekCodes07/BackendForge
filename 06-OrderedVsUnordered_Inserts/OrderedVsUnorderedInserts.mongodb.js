// MongoDB Playground
// Ordered vs Unordered Inserts Demo

use("myDb")

// Clean up previous data
db.users.drop()

// Create a unique index on email
// This will help us trigger duplicate key errors
db.users.createIndex(
  { email: 1 },
  { unique: true }
)


// ======================================================
// ORDERED INSERTS (DEFAULT BEHAVIOR)
// ======================================================

/*
Expected Behavior:

Document 1 -> Inserted ✅
Document 2 -> Inserted ✅
Document 3 -> Error ❌ (duplicate email)
STOP

Document 4 will NOT be inserted.
*/

db.users.insertMany([
  {
    username: "john_doe",
    email: "john@example.com",
    followers: 120
  },
  {
    username: "emma_smith",
    email: "emma@example.com",
    followers: 340
  },
  {
    username: "mike_jones",
    email: "john@example.com", // Duplicate Email
    followers: 85
  },
  {
    username: "sarah_wilson",
    email: "sarah@example.com",
    followers: 560
  }
])


// Check inserted documents
db.users.find()




// ======================================================
// RESET COLLECTION
// ======================================================

db.users.drop()

db.users.createIndex(
  { email: 1 },
  { unique: true }
)




// ======================================================
// UNORDERED INSERTS
// ======================================================

/*
Expected Behavior:

Document 1 -> Inserted ✅
Document 2 -> Inserted ✅
Document 3 -> Error ❌ (duplicate email)
Document 4 -> Inserted ✅

MongoDB continues processing remaining documents.
*/

db.users.insertMany(
  [
    {
      username: "john_doe",
      email: "john@example.com",
      followers: 120
    },
    {
      username: "emma_smith",
      email: "emma@example.com",
      followers: 340
    },
    {
      username: "mike_jones",
      email: "john@example.com", // Duplicate Email
      followers: 85
    },
    {
      username: "sarah_wilson",
      email: "sarah@example.com",
      followers: 560
    }
  ],
  {
    ordered: false
  }
)


// Check inserted documents
db.users.find()