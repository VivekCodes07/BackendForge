use("myDb");

/*
=========================================================
MongoDB Cursor Practice Playground
=========================================================

This playground is my practice while learning MongoDB Cursors.

Key Learning:

find() does NOT directly return documents.

find()
   ↓
Cursor
   ↓
Documents

A Cursor is a pointer to query results that allows MongoDB
to fetch documents gradually instead of loading everything
into memory at once.

Real World Usage:
- Instagram Feed
- Netflix Movies List
- Amazon Product Listing
- Pagination
=========================================================
*/

// ------------------------------------------------------
// Sample Data
// ------------------------------------------------------

db.posts.deleteMany({});

db.posts.insertMany([
  {
    title: "MongoDB Basics",
    author: "John",
    likes: 120
  },
  {
    title: "Understanding Collections",
    author: "Emma",
    likes: 95
  },
  {
    title: "MongoDB Operators",
    author: "Alex",
    likes: 340
  },
  {
    title: "Indexes Explained",
    author: "Sophia",
    likes: 210
  },
  {
    title: "Aggregation Pipeline",
    author: "David",
    likes: 450
  },
  {
    title: "Cursor Deep Dive",
    author: "Olivia",
    likes: 170
  },
  {
    title: "Schema Design",
    author: "Michael",
    likes: 290
  },
  {
    title: "Data Modeling",
    author: "Charlotte",
    likes: 180
  },
  {
    title: "MongoDB Performance",
    author: "James",
    likes: 510
  },
  {
    title: "Transactions",
    author: "Amelia",
    likes: 260
  }
]);

// ------------------------------------------------------
// 1. find() Returns a Cursor
// ------------------------------------------------------

const cursor = db.posts.find({});

/*
MongoDB returns a Cursor.

Think:

Cursor
  ↓
Post 1
Post 2
Post 3
...

The documents are not immediately loaded as an array.
*/

// ------------------------------------------------------
// 2. Reading Documents Using next()
// ------------------------------------------------------

cursor.next();

/*
Returns first document and moves cursor forward.
*/

// cursor.next();
// cursor.next();

/*
Every call to next() moves the cursor ahead.
*/

// ------------------------------------------------------
// 3. Checking if More Documents Exist
// ------------------------------------------------------

cursor.hasNext();

/*
Returns:

true  -> more documents exist
false -> cursor reached the end
*/

// ------------------------------------------------------
// 4. Iterating Through Entire Cursor
// ------------------------------------------------------

const allPostsCursor = db.posts.find({});

while (allPostsCursor.hasNext()) {
  printjson(allPostsCursor.next());
}

/*
Reads documents one by one until cursor ends.
*/

// ------------------------------------------------------
// 5. Convert Cursor Into Array
// ------------------------------------------------------

db.posts.find({}).toArray();

/*
Converts cursor into an array.

Good for small datasets.

Avoid on huge collections because MongoDB would need
to load everything into memory.
*/

// ------------------------------------------------------
// 6. Using limit()
// ------------------------------------------------------

db.posts.find({}).limit(3);

/*
Only return first 3 documents.

Real World:

Instagram Home Feed

Show only first few posts.
*/

// ------------------------------------------------------
// 7. Using skip()
// ------------------------------------------------------

db.posts.find({}).skip(3);

/*
Skip first 3 documents.

Cursor starts reading from document 4.
*/

// ------------------------------------------------------
// 8. Combining skip() and limit()
// ------------------------------------------------------

db.posts.find({})
        .skip(3)
        .limit(3);

/*
Skip first 3 documents
Then return next 3 documents
*/

// ------------------------------------------------------
// Pagination Example
// ------------------------------------------------------

/*
Imagine Instagram Feed

10 posts exist.

Page Size = 3
*/

// ------------------------------------------------------
// Page 1
// ------------------------------------------------------

db.posts.find({})
        .skip(0)
        .limit(3);

/*
Posts:

1
2
3
*/

// ------------------------------------------------------
// Page 2
// ------------------------------------------------------

db.posts.find({})
        .skip(3)
        .limit(3);

/*
Posts:

4
5
6
*/

// ------------------------------------------------------
// Page 3
// ------------------------------------------------------

db.posts.find({})
        .skip(6)
        .limit(3);

/*
Posts:

7
8
9
*/

// ------------------------------------------------------
// Page 4
// ------------------------------------------------------

db.posts.find({})
        .skip(9)
        .limit(3);

/*
Posts:

10
*/

// ------------------------------------------------------
// Pagination Formula
// ------------------------------------------------------

/*
For page-based pagination:

skip = (pageNumber - 1) * pageSize

Example:

Page Number = 3
Page Size = 5

skip = (3 - 1) * 5
skip = 10

Query:
*/

db.posts.find({})
        .skip(10)
        .limit(5);

// ------------------------------------------------------
// Sorting + Pagination
// ------------------------------------------------------

db.posts.find({})
        .sort({ likes: -1 })
        .limit(5);

/*
Show Top 5 Most Liked Posts

Very common in real applications.
*/

// ------------------------------------------------------
// Real World Example
// ------------------------------------------------------


db.posts.find({})
        .sort({ likes: -1 })
        .skip(0)
        .limit(3);

/*
Netflix:
Show Top Trending Movies

Instagram:
Show Most Popular Posts

Amazon:
Show Best Selling Products
*/

// ------------------------------------------------------
// Final Learning
// ------------------------------------------------------

/*
find()
   ↓
Returns Cursor

Cursor Methods:

next()      -> Get next document
hasNext()   -> Check if more documents exist
toArray()   -> Convert cursor into array
limit()     -> Restrict number of documents
skip()      -> Skip documents
sort()      -> Sort documents

Most Important Mental Model:

find()
   ↓
Cursor
   ↓
Documents

NOT

find()
   ↓
Documents
*/