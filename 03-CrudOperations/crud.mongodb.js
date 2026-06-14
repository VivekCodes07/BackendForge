/*
|--------------------------------------------------------------------------
| MongoDB Playground Notes
|--------------------------------------------------------------------------
|
| Today I learned how to connect MongoDB to VS Code using the MongoDB
| extension and a local MongoDB server.
|
| Connection Flow:
|
|     VS Code Playground
|            ↓
|     MongoDB Extension
|            ↓
|     localhost:27017
|            ↓
|     MongoDB Server
|
| The playground file allows me to execute MongoDB commands directly
| without writing a Node.js application.
|
| File: crud.mongodb.js
|
| Purpose:
| - Practice CRUD operations
| - Test queries quickly
| - Explore databases and collections
| - Learn MongoDB syntax before using it in backend projects
|
*/


/*
|--------------------------------------------------------------------------
| Connecting to Local MongoDB
|--------------------------------------------------------------------------
|
| The MongoDB extension is connected to:
|
|     mongodb://localhost:27017
|
| localhost = my computer
| 27017     = MongoDB's default port
|
| If the MongoDB server is running, VS Code can communicate with it
| and execute queries from this playground.
|
*/


/*
|--------------------------------------------------------------------------
| Database → Collection → Document
|--------------------------------------------------------------------------
|
| MongoDB stores data in the following hierarchy:
|
| Database
|   └── Collection
|          └── Document
|
| Example:
|
| college
|   └── students
|          └── { name: "Ali", age: 20 }
|
| A collection is similar to a table in SQL.
| A document is similar to a row in SQL.
|
*/


/*
|--------------------------------------------------------------------------
| Switching Databases
|--------------------------------------------------------------------------
|
| use("college")
|
| This command switches to the "college" database.
| If the database doesn't exist, MongoDB will create it when data
| is inserted for the first time.
|
*/

use("college");


/*
|--------------------------------------------------------------------------
| CRUD Commands I Have Learned
|--------------------------------------------------------------------------
|
| Create:
|     insertOne()
|     insertMany()
|
| Read:
|     find()
|     findOne()
|
| Update:
|     updateOne()
|     updateMany()
|
| Delete:
|     deleteOne()
|     deleteMany()
|
| These commands can be executed directly from the playground.
|
*/


/*
|--------------------------------------------------------------------------
| Why We Are Using a Playground
|--------------------------------------------------------------------------
|
| Before connecting MongoDB with Node.js and Express, the playground
| helps me focus only on the database side.
|
| It allows me to:
|
| ✓ Run queries instantly
| ✓ View results immediately
| ✓ Practice CRUD operations
| ✓ Explore collections visually
| ✓ Understand MongoDB without extra backend code
|
| Later, the same database will be connected to a Node.js application
| using the MongoDB driver or Mongoose.
|
*/