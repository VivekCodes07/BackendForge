/*
|--------------------------------------------------------------------------
| LESSON 05 - UNIQUE INDEXES
|--------------------------------------------------------------------------
|
| Goal:
| Understand how Unique Indexes help MongoDB prevent duplicate
| values while still providing fast lookups.
|
| Normal Index  -> Faster Queries
| Unique Index  -> Faster Queries + No Duplicates
|
*/

/*
|--------------------------------------------------------------------------
| Sample Data
|--------------------------------------------------------------------------
|
| Imagine I am building a social media application.
|
*/

db.users.insertMany([
  {
    username: "vivek",
    email: "vivek@gmail.com",
    phone: "9876543210"
  },
  {
    username: "alex",
    email: "alex@gmail.com",
    phone: "9876543211"
  },
  {
    username: "emma",
    email: "emma@gmail.com",
    phone: "9876543212"
  }
]);

/*
|--------------------------------------------------------------------------
| Creating A Unique Index
|--------------------------------------------------------------------------
|
| Every user should have a unique email.
|
| MongoDB will now reject duplicate emails.
|
*/

db.users.createIndex(
  {
    email: 1
  },
  {
    unique: true
  }
);

/*
|--------------------------------------------------------------------------
| Verify Existing Indexes
|--------------------------------------------------------------------------
*/

db.users.getIndexes();

/*
|--------------------------------------------------------------------------
| Insert A New User
|--------------------------------------------------------------------------
|
| Unique email -> Allowed
|
*/

db.users.insertOne({
  username: "john",
  email: "john@gmail.com",
  phone: "9876543213"
});

/*
|--------------------------------------------------------------------------
| Duplicate Email Example
|--------------------------------------------------------------------------
|
| This operation should fail because:
|
| vivek@gmail.com already exists.
|
| Expected:
| E11000 duplicate key error
|
*/

db.users.insertOne({
  username: "newUser",
  email: "vivek@gmail.com",
  phone: "9999999999"
});

/*
|--------------------------------------------------------------------------
| Unique Username Example
|--------------------------------------------------------------------------
|
| Many applications require usernames
| to be unique as well.
|
*/

db.users.createIndex(
  {
    username: 1
  },
  {
    unique: true
  }
);

/*
|--------------------------------------------------------------------------
| Duplicate Username Example
|--------------------------------------------------------------------------
|
| Should fail because username already exists.
|
*/

db.users.insertOne({
  username: "vivek",
  email: "vivek2@gmail.com",
  phone: "8888888888"
});

/*
|--------------------------------------------------------------------------
| Real World Example - Phone Number
|--------------------------------------------------------------------------
|
| Usually one account per phone number.
|
*/

db.users.createIndex(
  {
    phone: 1
  },
  {
    unique: true
  }
);

/*
|--------------------------------------------------------------------------
| Duplicate Phone Number Example
|--------------------------------------------------------------------------
|
| Should fail because phone number already exists.
|
*/

db.users.insertOne({
  username: "rohit",
  email: "rohit@gmail.com",
  phone: "9876543210"
});

/*
|--------------------------------------------------------------------------
| Query Using Unique Index
|--------------------------------------------------------------------------
|
| Unique indexes are still indexes.
|
| MongoDB can use them for fast lookups.
|
*/

db.users.find({
  email: "alex@gmail.com"
}).explain("executionStats");

/*
|--------------------------------------------------------------------------
| Compound Unique Index Example
|--------------------------------------------------------------------------
|
| Real World Scenario:
|
| A student should not be able to enroll in
| the same course twice.
|
*/

db.enrollments.insertMany([
  {
    studentId: 101,
    courseId: "MONGO101"
  },
  {
    studentId: 101,
    courseId: "NODE101"
  }
]);

/*
|--------------------------------------------------------------------------
| Create Compound Unique Index
|--------------------------------------------------------------------------
*/

db.enrollments.createIndex(
  {
    studentId: 1,
    courseId: 1
  },
  {
    unique: true
  }
);

/*
|--------------------------------------------------------------------------
| Different Course -> Allowed
|--------------------------------------------------------------------------
*/

db.enrollments.insertOne({
  studentId: 101,
  courseId: "REACT101"
});

/*
|--------------------------------------------------------------------------
| Same Student + Same Course -> Rejected
|--------------------------------------------------------------------------
|
| Duplicate enrollment.
|
*/

db.enrollments.insertOne({
  studentId: 101,
  courseId: "MONGO101"
});

/*
|--------------------------------------------------------------------------
| Udemy Style Example
|--------------------------------------------------------------------------
|
| One user should not purchase the same course twice.
|
*/

db.coursePurchases.createIndex(
  {
    userId: 1,
    courseId: 1
  },
  {
    unique: true
  }
);

db.coursePurchases.insertOne({
  userId: ObjectId("68651a4c2f8b7d1e9c7f1001"),
  courseId: ObjectId("68651a4c2f8b7d1e9c7f2001")
});

/*
|--------------------------------------------------------------------------
| Duplicate Purchase Attempt
|--------------------------------------------------------------------------
|
| Same user buying the same course again.
|
| MongoDB should reject it.
|
*/

db.coursePurchases.insertOne({
  userId: ObjectId("68651a4c2f8b7d1e9c7f1001"),
  courseId: ObjectId("68651a4c2f8b7d1e9c7f2001")
});

/*
|--------------------------------------------------------------------------
| Checking Index Definitions
|--------------------------------------------------------------------------
|
| Notice:
| unique: true
|
*/

db.coursePurchases.getIndexes();

/*
|--------------------------------------------------------------------------
| Key Learning
|--------------------------------------------------------------------------
|
| Normal Index:
|
|   Faster queries
|
| Unique Index:
|
|   Faster queries
|   + Duplicate prevention
|
| MongoDB automatically rejects duplicate values.
|
| Common Uses:
|
| - email
| - username
| - phone
| - sku
| - enrollment combinations
| - user-course purchases
|
| Unique indexes help maintain data integrity.
|
*/