show("dbs");

use("ecommerce");

db.createCollection("products");

/*
----------- Added products ------------
db.products.insertMany([
  {
    name: "iPhone 15 Pro",
    price: 129999,
    category: "Electronics",
    stock: 45
  },
  {
    name: "Dell XPS 13 Laptop",
    price: 115000,
    category: "Electronics",
    stock: 20
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    price: 29999,
    category: "Electronics",
    stock: 60
  },
  {
    name: "Nike Air Max Sneakers",
    price: 8995,
    category: "Footwear",
    stock: 120
  }
])
*/

/*
--------- Displaying all products of Electronics category ----------
db.products.find({category: "Electronics"})
*/

// Counting total products in Stored inside Products collection in database
db.products.countDocuments()