# MongoDB Query Practice

## Setup Database

```javascript
use('test')
```

## Insert Sample Data

```javascript
db.users.insertMany([
    {
        name: "Rahul Sharma",
        age: 22,
        city: "Delhi",
        email: "rahul@gmail.com",
        phone: "9876543210",
        isActive: true
    },
    {
        name: "Shreyansh Singh",
        age: 27,
        city: "Mumbai",
        email: "shreyansh@yahoo.com",
        isActive: true
    },
    {
        name: "Amit Verma",
        age: 30,
        city: "Delhi",
        email: "amit@gmail.com",
        phone: "9123456780",
        isActive: false
    },
    {
        name: "Sneha Gupta",
        age: 24,
        city: "Kolkata",
        email: "sneha@gmail.com",
        phone: "9988776655",
        isActive: true
    },
    {
        name: "Rohit Kumar",
        age: 29,
        city: "Chennai",
        email: "rohit@yahoo.com",
        isActive: true
    },
    {
        name: "Ankit Raj",
        age: 21,
        city: "San Fransisco",
        email: "ankit@gmail.com",
        phone: "8899776655",
        isActive: false
    },
    {
        name: "Neha Agarwal",
        age: 26,
        city: "Delhi",
        email: "neha@gmail.com",
        phone: "8877665544",
        isActive: true
    },
    {
        name: "Diya Kapoor",
        age: 23,
        city: "Mumbai",
        email: "diya@gmail.com",
        isActive: true
    },
    {
        name: "Karan Malhotra",
        age: 31,
        city: "Bangalore",
        email: "karan@yahoo.com",
        phone: "9988112233",
        isActive: false
    },
    {
        name: "Pooja Mishra",
        age: 28,
        city: "Lucknow",
        email: "pooja@gmail.com",
        phone: "7766554433",
        isActive: true
    }
])
```

---

# Queries

## Q1. Find all users from Delhi

```javascript
db.users.find({ city: 'Delhi' })
```

## Q2. Find users whose age is greater than 25

```javascript
db.users.find({
    age: { $gt: 25 }
})
```

## Q3. Find users whose age is less than or equal to 30

```javascript
db.users.find({
    age: { $lte: 30 }
})
```

## Q4. Find users who are not from Mumbai

```javascript
db.users.find({
    city: { $ne: 'Mumbai' }
})
```

**Alternative**

```javascript
db.users.find({
    city: { $nin: ['Mumbai'] }
})
```

## Q5. Find users whose age is between 20 and 30

**Using `$and`**

```javascript
db.users.find({
    $and: [
        { age: { $gt: 20 } },
        { age: { $lt: 30 } }
    ]
})
```

**Optimized Version**

```javascript
db.users.find({
    age: { $gt: 20, $lt: 30 }
})
```

## Q6. Display only name and email fields

```javascript
db.users.find(
    {},
    { name: 1, email: 1, _id: 0 }
)
```

## Q7. Find users whose name starts with "R"

```javascript
db.users.find({
    name: /^R/
})
```

## Q8. Find users with Gmail accounts

```javascript
db.users.find({
    email: /gmail/
})
```

## Q9. Find users where city field exists

```javascript
db.users.find({
    city: { $exists: true }
})
```

## Q10. Find users where phone field does not exist

```javascript
db.users.find({
    phone: { $exists: false }
})
```

## Q11. Sort users by age (Ascending)

```javascript
db.users.find().sort({
    age: 1
})
```

## Q12. Sort users by age (Descending)

```javascript
db.users.find().sort({
    age: -1
})
```

## Q13. Get first 5 users

```javascript
db.users.find().limit(5)
```

## Q14. Skip first 5 users and fetch next 2

```javascript
db.users.find()
    .skip(5)
    .limit(2)
```

## Q15. Find users whose age is in the given list

```javascript
db.users.find({
    age: { $in: [22, 25, 30] }
})
```

## Q16. Find users whose age is not in the given list

```javascript
db.users.find({
    age: { $nin: [22, 25, 30] }
})
```

## Q17. Count total documents

```javascript
db.users.countDocuments()
```

## Q18. Find Rahul Sharma from Delhi

```javascript
db.users.find({
    name: 'Rahul Sharma',
    city: 'Delhi'
})
```

## Q19. Find users from Mumbai or Delhi

```javascript
db.users.find({
    $or: [
        { city: 'Mumbai' },
        { city: 'Delhi' }
    ]
})
```

## Q20. Find users whose age is not greater than 30

```javascript
db.users.find({
    age: { $lte: 30 }
})
```

**Alternative**

```javascript
db.users.find({
    age: {
        $not: { $gt: 30 }
    }
})
```

## Q21. Find users whose name ends with "a"

```javascript
db.users.find({
    name: /a$/
})
```

## Q22. Find users with Yahoo email accounts

```javascript
db.users.find({
    email: /yahoo\.com$/
})
```

## Q23. Find users where age is a number

```javascript
db.users.find({
    age: { $type: 'number' }
})
```

## Q24. Find users with even ages

```javascript
db.users.find({
    age: {
        $mod: [2, 0]
    }
})
```

## Q25. Find users whose name length is greater than 5

```javascript
db.users.find({
    $expr: {
        $gt: [
            { $strLenCP: '$name' },
            5
        ]
    }
})
```

---

# MongoDB Operators Used

| Operator           | Description                            |
| ------------------ | -------------------------------------- |
| `$gt`              | Greater than                           |
| `$lt`              | Less than                              |
| `$lte`             | Less than or equal to                  |
| `$ne`              | Not equal                              |
| `$in`              | Match values in an array               |
| `$nin`             | Exclude values in an array             |
| `$and`             | Logical AND                            |
| `$or`              | Logical OR                             |
| `$not`             | Logical NOT                            |
| `$regex`           | Pattern matching                       |
| `$exists`          | Check field existence                  |
| `$type`            | Check data type                        |
| `$mod`             | Modulus operation                      |
| `$expr`            | Use aggregation expressions in queries |
| `$strLenCP`        | Calculate string length                |
| `sort()`           | Sort documents                         |
| `limit()`          | Limit result count                     |
| `skip()`           | Skip documents                         |
| `countDocuments()` | Count total documents                  |

```
```
