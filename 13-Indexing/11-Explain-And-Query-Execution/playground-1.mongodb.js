/*
===============================================================================
QUESTION:
Is MongoDB actually using my index?
===============================================================================
*/

/*
STEP 1:
Run query without index.
*/

db.users.find({
    username: "vivek"
}).explain("executionStats");

/*
Observe:

COLLSCAN

MongoDB had to scan everything.
*/

/*
STEP 2:
Create index.
*/

db.users.createIndex({
    username: 1
});

/*
Run same query again.
*/

db.users.find({
    username: "vivek"
}).explain("executionStats");

/*
Observe:

IXSCAN

MongoDB is now using the index.
*/

/*
STEP 3:
Look at totalDocsExamined.
*/

/*
STEP 4:
Look at totalKeysExamined.
*/

/*
STEP 5:
Try a Covered Query and look for:

totalDocsExamined: 0
*/