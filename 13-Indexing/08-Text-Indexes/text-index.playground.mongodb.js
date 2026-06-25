/*
|--------------------------------------------------------------------------
| LESSON 08 - TEXT INDEXES
|--------------------------------------------------------------------------
|
| Goal:
| Learn how MongoDB searches inside text fields.
|
| Until now:
| We searched exact values.
|
| Text Indexes allow searching words
| inside strings.
|
*/

/*
|--------------------------------------------------------------------------
| Sample Data - Udemy Courses
|--------------------------------------------------------------------------
*/

db.courses.insertMany([
  {
    title: "Complete MongoDB Masterclass",
    description: "Learn MongoDB indexing, aggregation and performance tuning"
  },
  {
    title: "Node.js API Development",
    description: "Build scalable backend APIs using Express and Node.js"
  },
  {
    title: "Backend Engineering Bootcamp",
    description: "Master backend development with MongoDB and Node.js"
  },
  {
    title: "React For Beginners",
    description: "Learn components, hooks and state management"
  }
]);

/*
|--------------------------------------------------------------------------
| Problem Without Text Index
|--------------------------------------------------------------------------
|
| Imagine thousands or millions of courses.
|
| Searching for:
|
| "mongodb"
|
| would require scanning lots of documents.
|
*/

/*
|--------------------------------------------------------------------------
| Creating My First Text Index
|--------------------------------------------------------------------------
|
| Notice:
|
| We use "text"
|
| instead of:
|
| 1
| -1
|
*/

db.courses.createIndex({
  title: "text"
});

/*
|--------------------------------------------------------------------------
| View Existing Indexes
|--------------------------------------------------------------------------
*/

db.courses.getIndexes();

/*
|--------------------------------------------------------------------------
| Basic Text Search
|--------------------------------------------------------------------------
|
| Find courses containing:
|
| MongoDB
|
*/

db.courses.find({
  $text: {
    $search: "MongoDB"
  }
});

/*
|--------------------------------------------------------------------------
| Search For Backend Courses
|--------------------------------------------------------------------------
*/

db.courses.find({
  $text: {
    $search: "backend"
  }
});

/*
|--------------------------------------------------------------------------
| Verify Index Usage
|--------------------------------------------------------------------------
|
| Look for:
|
| TEXT
| IXSCAN
|
*/

db.courses.find({
  $text: {
    $search: "MongoDB"
  }
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Multiple Word Search
|--------------------------------------------------------------------------
|
| MongoDB searches for both terms.
|
*/

db.courses.find({
  $text: {
    $search: "mongodb backend"
  }
});

/*
|--------------------------------------------------------------------------
| Real World Example - Blog Articles
|--------------------------------------------------------------------------
*/

db.articles.insertMany([
  {
    title: "Understanding MongoDB Indexes",
    content: "Indexes improve query performance"
  },
  {
    title: "Building REST APIs With Node.js",
    content: "Express makes API development easier"
  },
  {
    title: "Scaling Backend Applications",
    content: "Performance optimization techniques"
  }
]);

/*
|--------------------------------------------------------------------------
| Text Index On Article Titles
|--------------------------------------------------------------------------
*/

db.articles.createIndex({
  title: "text"
});

/*
|--------------------------------------------------------------------------
| Search Articles
|--------------------------------------------------------------------------
*/

db.articles.find({
  $text: {
    $search: "mongodb"
  }
});

/*
|--------------------------------------------------------------------------
| Indexing Multiple Fields
|--------------------------------------------------------------------------
|
| Search should work across:
|
| title
| description
|
*/

db.courses.createIndex({
  title: "text",
  description: "text"
});

/*
|--------------------------------------------------------------------------
| Search Word Present In Description
|--------------------------------------------------------------------------
|
| "indexing" exists in description,
| not necessarily title.
|
*/

db.courses.find({
  $text: {
    $search: "indexing"
  }
});

/*
|--------------------------------------------------------------------------
| Another Search Example
|--------------------------------------------------------------------------
*/

db.courses.find({
  $text: {
    $search: "Express"
  }
});

/*
|--------------------------------------------------------------------------
| Text Score
|--------------------------------------------------------------------------
|
| MongoDB can calculate relevance.
|
| Higher score = Better match.
|
*/

db.courses.find(
  {
    $text: {
      $search: "mongodb"
    }
  },
  {
    score: {
      $meta: "textScore"
    },
    title: 1
  }
);

/*
|--------------------------------------------------------------------------
| Sort By Relevance
|--------------------------------------------------------------------------
|
| Most relevant results first.
|
*/

db.courses.find(
  {
    $text: {
      $search: "mongodb"
    }
  },
  {
    score: {
      $meta: "textScore"
    },
    title: 1
  }
).sort({
  score: {
    $meta: "textScore"
  }
});

/*
|--------------------------------------------------------------------------
| Real World Example - Product Search
|--------------------------------------------------------------------------
*/

db.products.insertMany([
  {
    name: "Wireless Gaming Mouse",
    description: "High performance RGB gaming mouse"
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB keyboard for gaming and coding"
  },
  {
    name: "Laptop Stand",
    description: "Ergonomic aluminium laptop stand"
  }
]);

/*
|--------------------------------------------------------------------------
| Create Product Search Index
|--------------------------------------------------------------------------
*/

db.products.createIndex({
  name: "text",
  description: "text"
});

/*
|--------------------------------------------------------------------------
| User Searches "gaming"
|--------------------------------------------------------------------------
*/

db.products.find({
  $text: {
    $search: "gaming"
  }
});

/*
|--------------------------------------------------------------------------
| User Searches "laptop"
|--------------------------------------------------------------------------
*/

db.products.find({
  $text: {
    $search: "laptop"
  }
});

/*
|--------------------------------------------------------------------------
| Mental Model
|--------------------------------------------------------------------------
|
| Normal Index:
|
| username -> document
|
|
| Text Index:
|
| MongoDB
| Backend
| Node.js
| Express
|
| Each searchable word gets indexed.
|
*/

/*
|--------------------------------------------------------------------------
| Key Learning
|--------------------------------------------------------------------------
|
| Create Text Index:
|
| { title: "text" }
|
|
| Search Text:
|
| {
|   $text: {
|     $search: "mongodb"
|   }
| }
|
|
| Benefits:
|
| ✅ Fast text searching
| ✅ Search multiple words
| ✅ Search multiple fields
| ✅ Relevance scoring
|
|
| Common Use Cases:
|
| - Course Search
| - Blog Search
| - Product Search
| - Documentation Search
| - Article Search
|
*/