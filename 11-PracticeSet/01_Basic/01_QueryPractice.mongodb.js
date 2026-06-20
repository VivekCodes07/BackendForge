/*
Assume collection: users

1. Find all users from Delhi.
2. Find users whose age is greater than 25
3. Find users whose age is less than or equal to 30.
4. Find users whose city is not Mumbai.
5. Find users whose age is between 20 and 30.
6. Show only name and email of all users.
7. Find users whose name starts with "R".
8. Find users whose email contains gmail.
9. Find users whose city field exists.
10. Find users whose phone field does not exist.
11. Sort users by age ascending.
12. Sort users by age descending.
13. Show only first 5 users.
14. Skip first 10 users and show next 5 users.
15. Find users whose age is either 20, 25, or 30.
16. Find users whose age is not 20, 25, 30.
17. Count total users in database.
18. Find users whose name is Rahul Sharma and city is Delhi.
19. Find users whose city is Delhi OR Mumbai.
20. Find users whose age is not greater than 30.
21. Find users whose name ends with "a".
22. Find users whose email domain is yahoo.com.
23. Find users whose age field type is number.
24. Find users where age is even.
25. Find users whose name length is greater than 5 characters.
*/

use("myDb");
/*
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
        name: "Priya Singh",
        age: 27,
        city: "Mumbai",
        email: "priya@yahoo.com",
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
        city: "Patna",
        email: "rohit@yahoo.com",
        isActive: true
    },
    {
        name: "Ankit Raj",
        age: 21,
        city: "Patna",
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
        name: "Riya Das",
        age: 23,
        city: "Mumbai",
        email: "riya@gmail.com",
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
*/

// 1. Finding all users who are from Delhi.
db.users.find({ city: "Delhi" });

// 2. Finding users whose age is greater than 25.
db.users.find({ age: { $gt: 25 } });

// 3. Finding users whose age is less than or equal to 30.
db.users.find({ age: { $lte: 30 } });

// 4. Finding users whose city is not Mumbai.
db.users.find({ city: { $ne: "Mumbai" } });

// 5. Finding users whose age is between 20 and 30.
db.users.find(
  { $and: [{ age: { $gte: 20 } }, { age: { $lte: 30 } }] },
  { name: 1, age: 1 },
);

// 6. Showing only name and email of all users.
db.users.find({}, { _id: 0, name: 1, email: 1 });

// 7. Finding users whose name starts with "R"
db.users.find({ name: /^R/ });

// 8. Finding users wose email contains email.
db.users.find({ email: /gmail/ });

// 9. Finding users whose city field exists.
db.users.find({ city: { $exists: true } });

// 10. Finding users whose phone field does not exist.
db.users.find({ phone: { $exists: false } });

// 11. Sorting users by age ascending.
db.users.find().sort({ age: 1 });

// 12. Sorting users by age descending.
db.users.find().sort({ age: -1 });

// 13. Showing only first 5 users.
db.users.find().limit(5);

// 14. Skipping first 5 users and showing next 3 users
db.users.find().skip(5).limit(3);

// 15. Showing users whose age is either 20, 25, 30.
db.users.find({ $or: [{ age: 20 }, { age: 25 }, { age: 30 }] });

// Optimized way:
db.users.find({ age: { $in: [20, 25, 30] } });

// 16. Finding users whose age is not 20, 25, 30.
db.users.find({ age: { $nin: [20, 25, 30] } });

// 17. Counting total users in database.
db.users.countDocuments();

// 18. Finding user whose name is Rahul sharma and city is Delhi.
db.users.find({ name: "Rahul Sharma", city: "Delhi" });

// 19. Finding users whsoe city is Delhi or Mumbai.
db.users.find({ $or: [{ city: "Delhi" }, { city: "Mumbai" }] });

// 20. Finding users whose age is not greater than 30.
db.users.find({ age: { $lte: 30 } });

// 21. Finding users whose name ends with 'a'.
db.users.find({ name: /a$/ });

// 22. Finding users whose email domain is yahoo.com.
db.users.find({ email: /yahoo.com$/ });

// 23. Finding users whose age filed type is number.
db.users.find({ age: { $type: "number" } });

// 24. Finding users where age is even.
db.users.find({ age: { $mod: [2, 0] } });

// 25. Finding users whose name length is greater than 5 characters.
db.users.find({
  $expr: {
    $gt: [{ $strLenCP: "$name" }, 5],
  },
});
