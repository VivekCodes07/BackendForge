# MongoDB Practice Set (Q27 - Q57)

A collection of MongoDB practice exercises covering:

* Query operators
* Sorting and filtering
* Array operations
* Update operators
* Delete operations
* Date queries
* Nested documents
* Real-world collections (`products`, `orders`, `users`, `blogs`)

---

## Collections Used

### Products

Fields:

* `name`
* `price`
* `category`
* `stock`
* `discount`
* `tags`

### Orders

Fields:

* `user`
* `totalAmount`
* `status`
* `orderDate`

### Users

Fields:

* `name`
* `orders`
* `wishlist`
* `cart`

### Blogs

Fields:

* `title`
* `views`
* `comments`

---

# Query Practice

## Product Queries

### Q27

Find products with price greater than 1000.

### Q28

Find products with price between 500 and 2000.

### Q29

Find all products in the electronics category.

### Q30

Find products that are out of stock.

### Q31

Sort products by price in ascending order.

### Q32

Show the 5 most expensive products.

### Q33

Find products whose name contains "Phone".

### Q34

Find products with discount greater than 20%.

### Q35

Find products that are not in the electronics category.

---

# Array Operators

### Q36

Find products containing the `gaming` tag.

Operators:

* `$in`

### Q37

Find products containing both:

* `gaming`
* `laptop`

Operator:

* `$all`

### Q38

Find products whose tags array contains exactly 3 elements.

Operator:

* `$size`

---

# Array Updates

### Q39

Add a new tag to a product.

Operator:

* `$push`

### Q40

Remove a tag from a product.

Operator:

* `$pull`

---

# Order Queries

### Q41

Find orders placed by Rahul.

### Q43

Find orders placed after January 1, 2025.

### Q44

Find all delivered orders.

### Q45

Find all orders that are not cancelled.

---

# Update Operators

### Q46

Increase all product prices by 10%.

Operator:

* `$mul`

### Q47

Increase stock of all products by 50.

Operator:

* `$inc`

### Q48

Rename field:

```text
price → productPrice
```

Operator:

* `$rename`

### Q49

Remove discount field from all products.

Operator:

* `$unset`

### Q50

Add featured flag to all products.

Operator:

* `$set`

---

# Delete Operations

### Q51

Delete products with zero stock.

### Q52

Delete a user whose orders array is empty.

### Q53

Delete orders older than 5 years.

---

# Nested Document Operations

### Q54

Increase blog views by 1.

Operator:

* `$inc`

### Q55

Add a new comment to a blog.

Operator:

* `$push`

### Q56

Remove a specific comment from a blog.

Operator:

* `$pull`

---

# User Wishlist Practice

### Q57

Add a product to a user's wishlist.

Operator:

* `$push`

---

# Operators Covered

## Query Operators

* `$gt`
* `$lt`
* `$ne`
* `$in`
* `$all`
* `$size`
* Regular Expressions

## Update Operators

* `$set`
* `$inc`
* `$mul`
* `$rename`
* `$unset`
* `$push`
* `$pull`

## Utility Methods

* `.find()`
* `.sort()`
* `.limit()`
* `.updateOne()`
* `.updateMany()`
* `.deleteOne()`
* `.deleteMany()`

---

# Learning Goal

This practice set focuses on developing fluency with MongoDB CRUD operations and common update patterns used in real-world backend applications.

Topics covered:

* Filtering documents
* Sorting results
* Working with arrays
* Updating documents
* Deleting documents
* Handling dates
* Nested document manipulation
* E-commerce style data structures
* Blog/comment management systems
