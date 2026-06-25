/*
|--------------------------------------------------------------------------
| LESSON 09 - COVERED QUERIES
|--------------------------------------------------------------------------
|
| Goal:
| Understand what a Covered Query is and why it is one of the
| fastest query patterns in MongoDB.
|
| Key Idea:
|
| Normal Indexed Query:
|
| Index -> Document -> Result
|
|
| Covered Query:
|
| Index -> Result
|
| MongoDB never reads the actual document.
|
*/

/*
|--------------------------------------------------------------------------
| Sample Data
|--------------------------------------------------------------------------
*/

db.users.insertMany([
  {
    username: "vivek",
    email: "vivek@gmail.com",
    age: 24,
    city: "Chandigarh"
  },
  {
    username: "alex",
    email: "alex@gmail.com",
    age: 28,
    city: "New York"
  },
  {
    username: "emma",
    email: "emma@gmail.com",
    age: 26,
    city: "London"
  }
]);

/*
|--------------------------------------------------------------------------
| Creating A Compound Index
|--------------------------------------------------------------------------
|
| This index stores:
|
| username
| email
|
*/

db.users.createIndex({
  username: 1,
  email: 1
});

/*
|--------------------------------------------------------------------------
| View Existing Indexes
|--------------------------------------------------------------------------
*/

db.users.getIndexes();

/*
|--------------------------------------------------------------------------
| Example 1 - Indexed Query
|--------------------------------------------------------------------------
|
| MongoDB uses the index to find the document.
|
| But it still needs to fetch the document.
|
*/

db.users.find({
  username: "vivek"
});

/*
|--------------------------------------------------------------------------
| Verify Query Execution
|--------------------------------------------------------------------------
|
| Notice:
|
| MongoDB will examine documents.
|
*/

db.users.find({
  username: "vivek"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Example 2 - Covered Query
|--------------------------------------------------------------------------
|
| Query field:
| username
|
| Returned field:
| email
|
| Both exist in the index.
|
| _id is excluded.
|
*/

db.users.find(
  {
    username: "vivek"
  },
  {
    email: 1,
    _id: 0
  }
);

/*
|--------------------------------------------------------------------------
| Verify Covered Query
|--------------------------------------------------------------------------
|
| Important:
|
| Look for:
|
| totalDocsExamined: 0
|
*/

db.users.find(
  {
    username: "vivek"
  },
  {
    email: 1,
    _id: 0
  }
).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Why Is This Covered?
|--------------------------------------------------------------------------
|
| Index contains:
|
| username
| email
|
| Query needs:
|
| username
| email
|
| Nothing else.
|
*/

/*
|--------------------------------------------------------------------------
| Example 3 - Not Covered
|--------------------------------------------------------------------------
|
| age is NOT part of the index.
|
| MongoDB must fetch the document.
|
*/

db.users.find(
  {
    username: "vivek"
  },
  {
    age: 1,
    _id: 0
  }
);

/*
|--------------------------------------------------------------------------
| Verify Execution
|--------------------------------------------------------------------------
|
| totalDocsExamined will be greater than 0.
|
*/

db.users.find(
  {
    username: "vivek"
  },
  {
    age: 1,
    _id: 0
  }
).explain("executionStats");

/*
|--------------------------------------------------------------------------
| The Famous _id Trap
|--------------------------------------------------------------------------
|
| MongoDB automatically returns _id.
|
| Many beginners accidentally break
| Covered Queries because of this.
|
*/

db.users.find(
  {
    username: "vivek"
  },
  {
    email: 1
  }
);

/*
|--------------------------------------------------------------------------
| Why Is This Not Covered?
|--------------------------------------------------------------------------
|
| MongoDB returns:
|
| _id
| email
|
| But _id is not part of our index.
|
| Therefore document fetch is required.
|
*/

db.users.find(
  {
    username: "vivek"
  },
  {
    email: 1
  }
).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Fixing The Query
|--------------------------------------------------------------------------
|
| Explicitly remove _id.
|
*/

db.users.find(
  {
    username: "vivek"
  },
  {
    email: 1,
    _id: 0
  }
);

/*
|--------------------------------------------------------------------------
| Real World Example - Instagram
|--------------------------------------------------------------------------
*/

db.profiles.insertMany([
  {
    username: "vivek",
    followers: 15000,
    bio: "Backend Developer"
  },
  {
    username: "alex",
    followers: 8200,
    bio: "Frontend Developer"
  }
]);

/*
|--------------------------------------------------------------------------
| Create Index
|--------------------------------------------------------------------------
|
| Profile lookups frequently need:
|
| username
| followers
|
*/

db.profiles.createIndex({
  username: 1,
  followers: 1
});

/*
|--------------------------------------------------------------------------
| Covered Query
|--------------------------------------------------------------------------
|
| Everything required already exists
| inside the index.
|
*/

db.profiles.find(
  {
    username: "vivek"
  },
  {
    followers: 1,
    _id: 0
  }
);

/*
|--------------------------------------------------------------------------
| Verify Covered Query
|--------------------------------------------------------------------------
*/

db.profiles.find(
  {
    username: "vivek"
  },
  {
    followers: 1,
    _id: 0
  }
).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Real World Example - E-Commerce
|--------------------------------------------------------------------------
*/

db.products.insertMany([
  {
    name: "MacBook Air",
    price: 90000,
    description: "Apple laptop"
  },
  {
    name: "ThinkPad",
    price: 80000,
    description: "Business laptop"
  }
]);

/*
|--------------------------------------------------------------------------
| Product Listing Index
|--------------------------------------------------------------------------
*/

db.products.createIndex({
  name: 1,
  price: 1
});

/*
|--------------------------------------------------------------------------
| Covered Query
|--------------------------------------------------------------------------
|
| Product listing page only needs:
|
| name
| price
|
*/

db.products.find(
  {
    name: "MacBook Air"
  },
  {
    price: 1,
    _id: 0
  }
);

/*
|--------------------------------------------------------------------------
| Verify Execution
|--------------------------------------------------------------------------
*/

db.products.find(
  {
    name: "MacBook Air"
  },
  {
    price: 1,
    _id: 0
  }
).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Mental Model
|--------------------------------------------------------------------------
|
| Indexed Query:
|
| Index
|   ↓
| Document
|   ↓
| Result
|
|
| Covered Query:
|
| Index
|   ↓
| Result
|
|
| No document fetch.
|
*/

/*
|--------------------------------------------------------------------------
| Golden Indicator
|--------------------------------------------------------------------------
|
| Whenever checking a Covered Query:
|
| Use:
|
| .explain("executionStats")
|
| And look for:
|
| totalDocsExamined: 0
|
| This means MongoDB answered the query
| entirely from the index.
|
*/

/*
|--------------------------------------------------------------------------
| Key Learning
|--------------------------------------------------------------------------
|
| Covered Query Requirements:
|
| 1. Filter field must be indexed
|
| 2. Returned field must be indexed
|
| 3. No additional fields required
|
| 4. Usually exclude _id
|
|
| Benefits:
|
| ✅ No document fetch
| ✅ Less disk access
| ✅ Less memory usage
| ✅ Faster query execution
|
|
| Most Important Concept:
|
| The fastest query is not just a query
| that uses an index.
|
| The fastest query is often a query
| that never touches the document at all.
|
*/