use("myDb");

// I created this sample teachers collection so I can practice aggregation queries.
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


// ---------- $match ----------

// $match is just used to filter documents.
// Here I'm getting only the teachers whose gender is "male".

db.teachers.aggregate([
  {
    $match: { gender: "male" },
  },
]);



// ---------- $group with $push ----------

// Here I'm grouping teachers based on their age.
// $push collects the names of all teachers in the same age group
// and stores them inside an array called "names".

db.teachers.aggregate([
  {
    $group: {
      _id: "$age",
      names: { $push: "$name" },
    },
  },
]);



// ---------- $group with $$ROOT ----------

// Here I don't just want the names.
// I want the complete document of every teacher in each age group.
// $$ROOT refers to the entire current document.

db.teachers.aggregate([
  {
    $group: {
      _id: "$age",
      completeDetails: { $push: "$$ROOT" },
    },
  },
]);



// $$ROOT simply represents the whole current document.
// So instead of pushing a single field, it pushes everything.



// ---------- Count male teachers by age ----------

// First I filter only male teachers.
// Then I group them by age.
// $sum: 1 increases the count by 1 for every document in that group.

db.teachers.aggregate([
  { $match: { gender: "male" } },
  {
    $group: {
      _id: "$age",
      countOfTeachersInThisAgeGroup: { $sum: 1 },
    },
  },
]);



// ---------- Count + Sort ----------

// Same as the previous query,
// but after counting I'm sorting the result
// in descending order of the number of teachers.

db.teachers.aggregate([
  {
    $match: { gender: "male" },
  },
  {
    $group: {
      _id: "$age",
      numberOfTeachers: { $sum: 1 },
    },
  },
  {
    $sort: {
      numberOfTeachers: -1,
    },
  },
]);



// Aggregation works like a pipeline.
// I can keep adding stages one after another depending on what I want.