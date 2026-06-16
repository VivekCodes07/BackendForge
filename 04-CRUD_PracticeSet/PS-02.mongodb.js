show("dbs")

use("shopApp")

/*
-------- Inserted One Document---------

db.users.insertOne({name: "Prashant", email: "prashant@gmail.com", city: "Mohali", age: 21})
*/

/*
-------- Inserting Multiple Documents----------

db.users.insertMany([
  {
    name: "John",
    email: "john@gmail.com",
    city: "Texas",
    age: 23,
  },
  {
    name: "Brock",
    email: "brock@yahoo.com",
    city: "Las Vegas",
    age: 25,
  },
  {
    name: "Roman",
    email: "romanreigns@yahoo.com",
    city: "Dallas",
    age: 24,
  },
])
*/

// - Show all the users who are from Texas
db.users.find({city: "Texas"})