use("myDb");
/*
db.teachers.insertMany([
  { _id: 1, name: "John Doe", age: 35, gender: "male" },
  { _id: 2, name: "Jane Smith", age: 40, gender: "female" },
  { _id: 3, name: "Michael Johnson", age: 45, gender: "male" },
  { _id: 4, name: "Emily Williams", age: 30, gender: "female" },
  { _id: 5, name: "Robert Brown", age: 38, gender: "male" },
  { _id: 6, name: "Emma Jones", age: 33, gender: "female" },
  { _id: 7, name: "William Davis", age: 37, gender: "male" },
  { _id: 8, name: "Olivia Miller", age: 41, gender: "female" },
  { _id: 9, name: "David Wilson", age: 36, gender: "male" },
  { _id: 10, name: "Sophia Moore", age: 32, gender: "female" },
  { _id: 11, name: "Richard Taylor", age: 39, gender: "male" },
  { _id: 12, name: "Isabella Anderson", age: 43, gender: "female" },
  { _id: 13, name: "Joseph Thomas", age: 34, gender: "male" },
  { _id: 14, name: "Mia Jackson", age: 42, gender: "female" },
  { _id: 15, name: "Charles White", age: 36, gender: "male" },
  { _id: 16, name: "Abigail Harris", age: 31, gender: "female" },
  { _id: 17, name: "Daniel Martin", age: 44, gender: "male" },
  { _id: 18, name: "Evelyn Thompson", age: 38, gender: "female" },
  { _id: 19, name: "Matthew Garcia", age: 37, gender: "male" },
  { _id: 20, name: "Sofia Martinez", age: 35, gender: "female" },
  { _id: 21, name: "Andrew Robinson", age: 40, gender: "male" },
  { _id: 22, name: "Grace Clark", age: 33, gender: "female" },
  { _id: 23, name: "Joshua Rodriguez", age: 39, gender: "male" },
  { _id: 24, name: "Avery Lewis", age: 42, gender: "female" },
  { _id: 25, name: "Christopher Lee", age: 37, gender: "male" },
  { _id: 26, name: "Chloe Walker", age: 31, gender: "female" },
  { _id: 27, name: "Kevin Hall", age: 44, gender: "male" },
  { _id: 28, name: "Zoey Allen", age: 38, gender: "female" },
  { _id: 29, name: "Brian Young", age: 36, gender: "male" },
  { _id: 30, name: "Harper King", age: 34, gender: "female" },
]);
*/

db.teachers.aggregate([
  {
    $match: { gender: "male" },
  },
]);

// The names field uses the $push operator to add the name field from each document in the group to an array.
db.teachers.aggregate([
  {
    $group: { _id: "$age", names: { $push: "$name" } },
  },
]);

// Q. Group teachers by age and also show complete document per age group.
db.teachers.aggregate([
  {
    $group: { _id: "$age", completeDetails: { $push: "$$ROOT" } },
  },
]);

// The "$$ROOT" value is a reference to the current document being processed in the pipeline, which represents the complete document.

// Q. Give a count per age of male teacher.
db.teachers.aggregate([
  { $match: { gender: "male" } },
  {
    $group: { _id: "$age", countOfTeachersInThisAgeGroup: { $sum: 1 } },
  },
]);

// The value of $sum is 1, which means for each document in the group, the value of "number" will be increented by 1.

// Q. Give a count per age of male teachers and sort them by count in descending order.

db.teachers.aggregate([
  {
    $match: { gender: "male" },
  },
  {
    $group: { _id: "$age", numberOfTeachers: { $sum: 1 } },
  },
  {
    $sort: { numberOfTeachers: -1 },
  },
]);

// We can create pipeline as much as we want.

