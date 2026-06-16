show("dbs")

use("shopApp")

// Deleting user named Brock
// db.users.deleteOne({name: "Brock"})

/* Deleting all users whose age is less than 22 */
// db.users.deleteMany({age: {$lt: 20}})

db.users.find()