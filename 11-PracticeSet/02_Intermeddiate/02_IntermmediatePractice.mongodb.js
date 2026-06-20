use("myDb");
/*
db.products.insertMany([
  {
    name: "Gaming Laptop",
    price: 75000,
    category: "electronics",
    stock: 15,
    discount: 10,
    tags: ["gaming", "laptop", "electronics"]
  },
  {
    name: "Smartphone",
    price: 25000,
    category: "electronics",
    stock: 8,
    discount: 15,
    tags: ["phone", "android", "electronics"]
  },
  {
    name: "Wireless Mouse",
    price: 800,
    category: "accessories",
    stock: 50,
    discount: 5,
    tags: ["mouse", "computer", "electronics"]
  },
  {
    name: "Mechanical Keyboard",
    price: 3500,
    category: "accessories",
    stock: 20,
    discount: 12,
    tags: ["keyboard", "gaming", "computer"]
  },
  {
    name: "LED Monitor",
    price: 12000,
    category: "electronics",
    stock: 5,
    discount: 18,
    tags: ["monitor", "display", "electronics"]
  },
  {
    name: "Office Chair",
    price: 6000,
    category: "furniture",
    stock: 0,
    discount: 20,
    tags: ["chair", "office", "furniture"]
  },
  {
    name: "Gaming Headset",
    price: 4500,
    category: "electronics",
    stock: 12,
    discount: 25,
    tags: ["gaming", "audio", "electronics"]
  },
  {
    name: "Study Table",
    price: 7000,
    category: "furniture",
    stock: 10,
    discount: 8,
    tags: ["table", "wood", "furniture"]
  },
  {
    name: "Bluetooth Speaker",
    price: 2800,
    category: "electronics",
    stock: 30,
    discount: 22,
    tags: ["audio", "wireless", "electronics"]
  },
  {
    name: "USB-C Charger",
    price: 1200,
    category: "accessories",
    stock: 60,
    discount: 5,
    tags: ["charger", "mobile", "electronics"]
  },
  {
    name: "4K Smart TV",
    price: 55000,
    category: "electronics",
    stock: 3,
    discount: 30,
    tags: ["tv", "smart", "electronics"]
  },
  {
    name: "Bookshelf",
    price: 4500,
    category: "furniture",
    stock: 7,
    discount: 10,
    tags: ["books", "wood", "furniture"]
  },
  {
    name: "Webcam",
    price: 2200,
    category: "accessories",
    stock: 25,
    discount: 7,
    tags: ["camera", "computer", "electronics"]
  },
  {
    name: "Gaming Mouse Pad",
    price: 500,
    category: "accessories",
    stock: 80,
    discount: 3,
    tags: ["gaming", "mousepad", "computer"]
  },
  {
    name: "Power Bank",
    price: 1800,
    category: "electronics",
    stock: 40,
    discount: 12,
    tags: ["mobile", "battery", "electronics"]
  }
])
*/

/*
Q27. Find products with price greater than 1000.
Q28. Find products with price between 500 and 2000.
Q29. Find all products in the electronics category.
Q30. Find products that are out of stock.
Q31. Sort products by price in ascending order.
Q32. Show the 5 most expensive products.
Q33. Find products whose name contains "phone".
Q34. Find products with discount greater than 20%.
Q35. Find products that are not in the electronics category.

----------------Array Operators-------------:
Q36. Find products containing the gaming tag.
Q37. Find products containing both:
    - gaming
    - laptop
Q38. Find products whose tags array contains exactly 3 elements.

--------------- Array Updates ----------------
Q39. Add a new tag to a product.
Q40. Remove a tag from a product.

-------------- Order Queries -----------------
Q41. Find orders placed by Rahul.
Q43. Find orders placed after January 1, 2025.
Q44. Find all delivered orders.
Q45. Find all orders that are not cancelled.

-------------- Update Operators --------------
Q45. Find all orders that are not cancelled.
Q46. Increase all product prices by 10%.
Q47. Increase stock of all products by 50.
Q48. Rename field:
        price → productPrice
Q49. Remove discount field from all products.
Q50. Add featured flag to all products.

----------------Delete Operations----------------
Q51. Delete products with zero stock.

Q52. Delete a user whose orders array is empty.

Q53. Delete orders older than 5 years.
*/

// 27. Finding products with price > 1000.
db.products.find({ price: { $gt: 1000 } });

// 28. Finding products with price between 500 and 2000.
db.products.find({
  $and: [{ price: { $gte: 500 } }, { price: { $lte: 2000 } }],
});

// 29. Finding all products of the electronic category.
db.products.find({ category: "electronics" });

// 30. Finding products that are out of stock.
db.products.find({ stock: 0 });

// 31. Sort products by price in ascending order.
db.products.find().sort({ price: 1 });

// 32. Show the 5 most expensive products.
db.products.find().sort({ price: -1 }).limit(5);

// 33. Finding products whose name contains "Phone".
db.products.find({ name: /phone/i });

// 34. Finding products with discount > 20%
db.products.find({ discount: { $gt: 20 } });

// 35. Finding products that are not in the electronic category.
db.products.find({ category: { $ne: "electronics" } });

// 36. Finding products containing the gaming tag.
db.products.find({ tags: { $all: ["gaming"] } });

// 37. Finding products containing both i> Gaming and ii> laptop.
db.products.find({ tags: { $all: ["gaming", "laptop"] } });

// 38. Finding products whose tag array contains exactly three elements.
db.products.find({ tags: { $size: 3 } });

// 39. Adding a new tag to a product.
/*
db.products.updateOne(
  { name: "Wireless Mouse" },
  { $push: { tags: "hardware device" } },
);
*/

// 40. Removing a tag from a product.
db.products.updateOne({ name: "Smartphone" }, { $pull: { tags: "phone" } });

/*--------------Order Queries------------- */
/*
db.orders.insertMany([
  {
    user: "Rahul Sharma",
    totalAmount: 80000,
    status: "delivered",
    orderDate: new Date("2025-02-10"),
  },
  {
    user: "Priya Singh",
    totalAmount: 3000,
    status: "pending",
    orderDate: new Date("2025-03-01"),
  },
  {
    user: "Amit Verma",
    totalAmount: 15000,
    status: "cancelled",
    orderDate: new Date("2024-12-15"),
  },
  {
    user: "Rahul Sharma",
    totalAmount: 4500,
    status: "delivered",
    orderDate: new Date("2025-01-20"),
  },
  {
    user: "Sneha Gupta",
    totalAmount: 1200,
    status: "pending",
    orderDate: new Date("2025-03-05"),
  },
]);
*/

// 41. Finding orders placed by Rahul.
db.orders.find();
db.orders.find({ user: "Rahul Sharma" });

// 42. Finding orders whose total amount > 5000.
db.orders.find({ totalAmount: { $gt: 5000 } });

// 43. Find orders placed after 1 Jan 2025.
db.orders.find({ orderDate: { $gt: new Date("2025-01-01") } });

// 44. Finding all delivered orders.
db.orders.find({ status: "delivered" });

// 45. Finding all orders that are not cancelled.
db.orders.find({ status: { $ne: "cancelled" } });

/*----------------Update Operators--------------- */

// 46. Increase all products prices by 10%.
// db.products.updateMany({}, {$mul: {price: 1.10}})

// 47. Increase the stock of all products by 50.
// db.products.updateMany({}, {$inc: {stock: 50}})

// 48. Rename field: price → productPrice
db.products.updateMany({}, { $rename: { price: "productPrice" } });

// 49. Remove discount field from all products.
db.products.updateMany({}, { $unset: { discount: "" } });

// 50. Add featured flag to a product.
// db.products.updateOne({name: "Smartphone"}, {$set: {featured: true}});

/*--------------- Delete Operators --------------- */
db.products.updateOne({ name: "Gaming Laptop" }, { $set: { stock: 0 } });

// 51. Deleting product with zero stock.
db.products.deleteOne({ stock: 0 });

db.products.updateOne(
  { name: "Smartphone" },
  { $pullAll: { tags: ["android", "electronics"] } },
);
// 52. Deleting a user whose tags array is empty.
db.products.deleteOne({ tags: { $size: 0 } });

// 53. Delete orders older than 5 years.
db.orders.deleteMany({
  orderDate: { $lt: ISODate("2020-09-01") },
});

// 55. Add new comment to blog post
db.posts.updateOne({ _id: 1 }, { $push: { comments: "Great article!" } });

// 56. Remove a specific comment
db.posts.updateOne({ _id: 1 }, { $pull: { comments: "Great article!" } });

// 57. Add product to user wishlist
db.users.updateOne({ _id: 1 }, { $addToSet: { wishlist: "P1001" } });

// 58. Remove product from wishlist
db.users.updateOne({ _id: 1 }, { $pull: { wishlist: "P1001" } });

// 59. Add item to shopping cart
db.cart.updateOne(
  { userId: 1 },
  {
    $push: {
      items: {
        productId: "P1001",
        quantity: 1,
      },
    },
  },
);

// 60. Remove item from cart
db.cart.updateOne(
  { userId: 1 },
  {
    $pull: {
      items: { productId: "P1001" }
    }
  }
)