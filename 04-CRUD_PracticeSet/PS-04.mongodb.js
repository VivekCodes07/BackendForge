show("dbs")

use("shopApp")

// show("collections")

// db.users.find()

// Updated user's city
// db.users.updateOne({name: "Vivek"}, {$set: {city: "Osaka"}})

/* -------- Updating all documents in the users collection where the age is greater than 22. It sets their age field to the string value "Too Old" ----------

db.users.updateMany(
  { age: { $gt: 22 } },     // Filter condition
  { $set: { age: "Too Old" } } // Update operation
)
*/

/* -------- Updating email of user with name: "John" ---------- */

// db.users.updateOne({name: "John"}, {$set: {email: "john1237@gmail.com"}})

db.users.find({name: "John"})