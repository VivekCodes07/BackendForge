show("dbs")

use('shopApp')

db.createCollection("users")
/*
db.users.insertOne({
    name: "Vivek",
    email: "vivek@yahoo.com",
    city: "Kyoto",
    age: 20
})
*/
db.users.find()