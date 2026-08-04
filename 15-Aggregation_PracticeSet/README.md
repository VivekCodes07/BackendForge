# 📊 MongoDB Aggregation Practice Project

This project contains **real-world MongoDB datasets and aggregation queries** designed to help you master MongoDB concepts like `$group`, `$unwind`, `$lookup`, and more.

---

## 🚀 Project Overview

This repository is a **hands-on practice set** for learning MongoDB Aggregation Framework using:

* 🧾 Orders dataset (complex nested structure)
* 👥 Users dataset
* 🔗 Orders-Users relation using `$lookup`
* 📊 Real-world analytical queries

---

## 📂 Collections Used

### 1️⃣ `orders` (Main Dataset)

Contains detailed order information including:

* Customer name
* City
* Multiple products (array)
* Payment method
* Order status

Each order includes multiple products like:

```js
products: [
  { name: "Laptop", category: "Electronics", price: 50000, quantity: 1 }
]
```

---

### 2️⃣ `users`

Basic user information:

* `_id`
* `name`
* `city`

---

### 3️⃣ `orders2`

Simplified orders collection used for:

* Practicing `$lookup` (MongoDB JOIN)

---

## 🧠 Concepts Covered

This project helps you practice:

* `$unwind` → Flatten arrays
* `$group` → Aggregation & grouping
* `$sum`, `$avg`, `$multiply`
* `$match` → Filtering
* `$sort`, `$limit`
* `$lookup` → Join collections
* Pagination using aggregation

---

## 📊 Practice Questions

### 🔹 Basic to Intermediate

1. Find total sales of each category
2. Find top spending customer
3. Show all products bought by each customer
4. Find customers who spent more than ₹50,000
5. Find most sold product
6. Create pagination using aggregation
7. Find average order value per city

---

### 🔹 Advanced

8. Create analytics dashboard data:

   * Total products sold per category
   * Total revenue
   * Average price

9. Join users and orders using `$lookup`

10. Find users having no orders

---

## 🛠️ Sample Aggregation Example

### ✅ Total Sales Per Category

```js
db.orders.aggregate([
  { $unwind: "$products" },
  {
    $group: {
      _id: "$products.category",
      totalSales: {
        $sum: {
          $multiply: ["$products.price", "$products.quantity"]
        }
      }
    }
  }
])
```

---

## ⚙️ How to Use

1. Open MongoDB shell / MongoDB Compass
2. Create a database (e.g. `ecommerceDB`)
3. Insert provided sample data into:

   * `orders`
   * `users`
   * `orders2`
4. Run aggregation queries

---

## 🎯 Learning Outcome

After completing this project, you will be able to:

* Write complex aggregation pipelines
* Perform real-world data analysis in MongoDB
* Handle nested data structures
* Use `$lookup` like SQL JOIN
* Build backend-ready analytics queries

---

## 💡 Bonus Tip

This dataset is **interview-level practice**.
If you master these queries, you're ahead of most beginners 🚀

---

## 🙌 Author

Built for learning and practice by a future Full Stack Developer 💻🔥

---
