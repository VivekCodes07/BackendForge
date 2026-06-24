/*
|--------------------------------------------------------------------------
| LESSON 07 - MULTIKEY INDEXES
|--------------------------------------------------------------------------
|
| Goal:
| Understand how MongoDB indexes array fields.
|
| Important:
| If an indexed field contains an array,
| MongoDB automatically creates a Multikey Index.
|
| No special command exists.
|
| createIndex() is still used.
|
*/

/*
|--------------------------------------------------------------------------
| Sample Data - Udemy Courses
|--------------------------------------------------------------------------
*/

db.courses.insertMany([
  {
    title: "Backend Bootcamp",
    technologies: ["Node.js", "MongoDB", "Express"]
  },
  {
    title: "Frontend Bootcamp",
    technologies: ["React", "JavaScript", "CSS"]
  },
  {
    title: "Full Stack Bootcamp",
    technologies: ["React", "Node.js", "MongoDB"]
  }
]);

/*
|--------------------------------------------------------------------------
| Query Before Creating Index
|--------------------------------------------------------------------------
|
| MongoDB may need to scan every course
| to find "MongoDB".
|
*/

db.courses.find({
  technologies: "MongoDB"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Creating Index On Array Field
|--------------------------------------------------------------------------
|
| technologies is an array.
|
| MongoDB automatically creates
| a Multikey Index.
|
*/

db.courses.createIndex({
  technologies: 1
});

/*
|--------------------------------------------------------------------------
| View Existing Indexes
|--------------------------------------------------------------------------
*/

db.courses.getIndexes();

/*
|--------------------------------------------------------------------------
| Query Using Multikey Index
|--------------------------------------------------------------------------
|
| MongoDB can directly locate
| courses containing MongoDB.
|
*/

db.courses.find({
  technologies: "MongoDB"
});

/*
|--------------------------------------------------------------------------
| Verify Index Usage
|--------------------------------------------------------------------------
|
| Look for:
|
| IXSCAN
|
*/

db.courses.find({
  technologies: "MongoDB"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Matching Another Technology
|--------------------------------------------------------------------------
*/

db.courses.find({
  technologies: "React"
});

/*
|--------------------------------------------------------------------------
| Matching Another Technology
|--------------------------------------------------------------------------
*/

db.courses.find({
  technologies: "Express"
});

/*
|--------------------------------------------------------------------------
| Mental Model
|--------------------------------------------------------------------------
|
| Document:
|
| {
|   technologies: [
|     "Node.js",
|     "MongoDB",
|     "Express"
|   ]
| }
|
|
| Conceptual Index Entries:
|
| Node.js  -> Document
| MongoDB  -> Document
| Express  -> Document
|
|
| One document creates multiple
| index entries.
|
*/

/*
|--------------------------------------------------------------------------
| Real World Example - Netflix Genres
|--------------------------------------------------------------------------
*/

db.movies.insertMany([
  {
    title: "Interstellar",
    genres: ["Sci-Fi", "Adventure", "Drama"]
  },
  {
    title: "Inception",
    genres: ["Sci-Fi", "Thriller"]
  },
  {
    title: "Titanic",
    genres: ["Romance", "Drama"]
  }
]);

/*
|--------------------------------------------------------------------------
| Create Multikey Index
|--------------------------------------------------------------------------
*/

db.movies.createIndex({
  genres: 1
});

/*
|--------------------------------------------------------------------------
| Find All Sci-Fi Movies
|--------------------------------------------------------------------------
*/

db.movies.find({
  genres: "Sci-Fi"
});

/*
|--------------------------------------------------------------------------
| Verify Index Usage
|--------------------------------------------------------------------------
*/

db.movies.find({
  genres: "Sci-Fi"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Another Real World Example - Blog Tags
|--------------------------------------------------------------------------
*/

db.posts.insertMany([
  {
    title: "MongoDB Indexing",
    tags: ["mongodb", "database", "backend"]
  },
  {
    title: "Learning React",
    tags: ["react", "frontend", "javascript"]
  },
  {
    title: "Node.js APIs",
    tags: ["nodejs", "backend", "api"]
  }
]);

/*
|--------------------------------------------------------------------------
| Create Index On Tags
|--------------------------------------------------------------------------
*/

db.posts.createIndex({
  tags: 1
});

/*
|--------------------------------------------------------------------------
| Find Posts Tagged With "backend"
|--------------------------------------------------------------------------
*/

db.posts.find({
  tags: "backend"
});

/*
|--------------------------------------------------------------------------
| Verify Query Plan
|--------------------------------------------------------------------------
*/

db.posts.find({
  tags: "backend"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Array Contains Matching Value
|--------------------------------------------------------------------------
|
| MongoDB checks:
|
| Does the array contain this value?
|
*/

db.posts.find({
  tags: "mongodb"
});

db.posts.find({
  tags: "frontend"
});

db.posts.find({
  tags: "api"
});

/*
|--------------------------------------------------------------------------
| Multiple Documents Can Match
|--------------------------------------------------------------------------
*/

db.courses.find({
  technologies: "Node.js"
});

/*
|--------------------------------------------------------------------------
| Why Multikey Indexes Matter
|--------------------------------------------------------------------------
|
| Common Array Fields:
|
| - technologies
| - tags
| - genres
| - skills
| - categories
| - interests
|
| These fields are searched frequently
| and are excellent index candidates.
|
*/

/*
|--------------------------------------------------------------------------
| Key Learning
|--------------------------------------------------------------------------
|
| createIndex({ technologies: 1 })
|
| If technologies is an array:
|
| MongoDB automatically creates
| a Multikey Index.
|
|
| Example:
|
| ["MongoDB", "Node.js", "Express"]
|
| becomes conceptually:
|
| MongoDB -> Document
| Node.js -> Document
| Express -> Document
|
|
| Benefits:
|
| ✅ Faster array searches
| ✅ Avoids COLLSCAN
| ✅ Works automatically
|
*/