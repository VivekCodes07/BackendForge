/*
===============================================================================
LESSON 10: TTL INDEXES (Time To Live)
===============================================================================

Until now every index I created had one purpose:

→ Make queries faster

Examples:
- Single Field Index
- Compound Index
- Unique Index
- Multikey Index
- Text Index

But TTL Indexes are different.

Their purpose is NOT query performance.

Their purpose is:

→ Automatically delete documents after a certain time.

Think:

OTP expires
Session expires
Password reset token expires
Cache expires

Instead of writing cron jobs and cleanup scripts,
MongoDB can handle it itself.
===============================================================================
*/


/*
===============================================================================
SCENARIO 1: OTP SYSTEM
===============================================================================

Let's say I'm building a login system.

Whenever a user requests an OTP,
I store it in MongoDB.

Question:

Should OTPs stay forever?

Obviously not.

An OTP after 5 minutes is useless.

Perfect use case for TTL.
===============================================================================
*/

db.otps.insertMany([
  {
    email: "vivek@gmail.com",
    otp: "834291",
    createdAt: new Date()
  },
  {
    email: "john@gmail.com",
    otp: "192734",
    createdAt: new Date()
  }
]);

db.otps.find();


/*
===============================================================================
CREATING MY FIRST TTL INDEX
===============================================================================

300 seconds = 5 minutes

MongoDB will monitor this collection.

Whenever:

createdAt + 300 seconds

becomes older than current time,

MongoDB will automatically remove the document.
===============================================================================
*/

db.otps.createIndex(
  {
    createdAt: 1
  },
  {
    expireAfterSeconds: 300
  }
);


/*
===============================================================================
VERIFYING THE INDEX
===============================================================================

I should see:

expireAfterSeconds: 300

inside the index definition.
===============================================================================
*/

db.otps.getIndexes();


/*
===============================================================================
HOW I VISUALIZE TTL INTERNALLY
===============================================================================

Document created at:

10:00 AM

TTL:

300 seconds

MongoDB calculates:

10:00 + 5 minutes

= 10:05

After that the document becomes eligible for deletion.

Important:

MongoDB DOES NOT instantly delete it.

A background TTL monitor runs periodically.

So expiration is automatic,
but not exact to the millisecond.
===============================================================================
*/


/*
===============================================================================
SCENARIO 2: PASSWORD RESET TOKENS
===============================================================================

Real applications generate temporary reset tokens.

Example:

https://app.com/reset-password/token123

This token should not remain valid forever.

Let's keep it for 30 minutes.
===============================================================================
*/

db.resetTokens.insertMany([
  {
    email: "vivek@gmail.com",
    token: "reset_token_123",
    createdAt: new Date()
  },
  {
    email: "alex@gmail.com",
    token: "reset_token_456",
    createdAt: new Date()
  }
]);


/*
===============================================================================
30 MINUTES
===============================================================================

30 × 60

= 1800 seconds
===============================================================================
*/

db.resetTokens.createIndex(
  {
    createdAt: 1
  },
  {
    expireAfterSeconds: 1800
  }
);

db.resetTokens.getIndexes();


/*
===============================================================================
SCENARIO 3: LOGIN SESSIONS
===============================================================================

Imagine Netflix.

User logs in.

A session document gets created.

Session shouldn't stay forever.

Let's keep it for 24 hours.
===============================================================================
*/

db.sessions.insertMany([
  {
    sessionId: "sess_101",
    userId: ObjectId("685c9a41c6f4f56e2a1b101"),
    createdAt: new Date()
  },
  {
    sessionId: "sess_102",
    userId: ObjectId("685c9a41c6f4f56e2a1b102"),
    createdAt: new Date()
  }
]);


/*
===============================================================================
24 HOURS
===============================================================================

24 × 60 × 60

= 86400 seconds
===============================================================================
*/

db.sessions.createIndex(
  {
    createdAt: 1
  },
  {
    expireAfterSeconds: 86400
  }
);

db.sessions.getIndexes();


/*
===============================================================================
SCENARIO 4: SEARCH CACHE
===============================================================================

Suppose my backend caches search results.

Search:

"mongodb indexing"

Results are stored temporarily.

Keeping cache forever is pointless.

Let's remove it after 10 minutes.
===============================================================================
*/

db.searchCache.insertOne({
  query: "mongodb indexing",
  results: [
    "Indexing Basics",
    "Compound Indexes",
    "Covered Queries"
  ],
  createdAt: new Date()
});


/*
===============================================================================
10 MINUTES
===============================================================================

10 × 60

= 600 seconds
===============================================================================
*/

db.searchCache.createIndex(
  {
    createdAt: 1
  },
  {
    expireAfterSeconds: 600
  }
);

db.searchCache.getIndexes();


/*
===============================================================================
VERY IMPORTANT REQUIREMENT
===============================================================================

TTL ONLY WORKS ON DATE FIELDS

Correct:
-------------------------------------------------------------------------------
*/

db.demo.insertOne({
  message: "Valid TTL Example",
  createdAt: new Date()
});


/*
Wrong:
-------------------------------------------------------------------------------

{
   createdAt: "25 June 2026"
}

This is just a string.

TTL cannot work properly.
===============================================================================
*/


/*
===============================================================================
COMMON BEGINNER MISTAKE #1
===============================================================================

Thinking:

"Document will disappear exactly after 5 minutes"

Not true.

MongoDB checks periodically.

Therefore:

Expired
≠
Instantly Deleted
===============================================================================
*/


/*
===============================================================================
COMMON BEGINNER MISTAKE #2
===============================================================================

Using TTL on permanent business data.

Never do this.

Bad Examples:

Users
Orders
Products
Payments
Transactions

Imagine customer orders disappearing automatically 😂

That would be a disaster.
===============================================================================
*/


/*
===============================================================================
GOOD TTL USE CASES
===============================================================================

✓ OTPs

✓ Sessions

✓ Verification Links

✓ Password Reset Tokens

✓ Cache Data

✓ Temporary Logs

✓ Temporary Notifications
===============================================================================
*/


/*
===============================================================================
MY FINAL MENTAL MODEL
===============================================================================

Normal Index:

"Help MongoDB find data faster."

TTL Index:

"Help MongoDB automatically remove data."

Whenever I create:

db.otps.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 300 }
)

I read it as:

"MongoDB, this document only has a life of 5 minutes.
After that, clean it up yourself."

That's exactly what a TTL Index does.
===============================================================================
*/