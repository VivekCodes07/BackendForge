/*
===============================================================================
                    PLAYGROUND - WHY AGGREGATION?
===============================================================================

Up until now, whenever I wanted data from MongoDB, I used:

    • find()
    • findOne()
    • findById()

These methods are perfect when I simply want to retrieve documents.

But what if I want answers instead of raw documents?

That's where Aggregation comes in.
*/


// ============================================================================
// Sample Collection
// ============================================================================

db.courses.insertMany([
    {
        title: "MongoDB Mastery",
        instructor: "Vivek",
        category: "Database",
        price: 4999,
        studentsEnrolled: 1200,
        rating: 4.9
    },
    {
        title: "Node.js Bootcamp",
        instructor: "Akshay",
        category: "Backend",
        price: 3999,
        studentsEnrolled: 850,
        rating: 4.8
    },
    {
        title: "React Complete Guide",
        instructor: "Hitesh",
        category: "Frontend",
        price: 4499,
        studentsEnrolled: 1600,
        rating: 4.9
    },
    {
        title: "Express.js API",
        instructor: "Vivek",
        category: "Backend",
        price: 2999,
        studentsEnrolled: 600,
        rating: 4.7
    }
]);



/*
===============================================================================
What find() is good at
===============================================================================
*/

db.courses.find();

db.courses.find({
    category: "Backend"
});

db.courses.find({
    instructor: "Vivek"
});


/*
These queries simply return documents.

Nothing is calculated.

Nothing is grouped.

Nothing is transformed.

MongoDB is only fetching data.
*/



/*
===============================================================================
Now imagine my manager asks...
===============================================================================

1. What's the average price of all courses?

2. Which instructor has the most students?

3. Which category has the highest number of courses?

4. What's the total revenue if every enrolled student bought the course?

5. Show me the top 3 highest rated courses.

Can find() answer all of these?

Not really.

These are analytical questions.

They require processing the data.
*/



/*
===============================================================================
This is where Aggregation comes in.
===============================================================================

Every aggregation starts with:

db.collection.aggregate([])

Notice something...

aggregate() takes an ARRAY.

Why?

Because every element inside the array represents a stage.

MongoDB executes them one after another.
*/


db.courses.aggregate([]);


/*
Right now the pipeline is empty.

Nothing happens.

But over the next lessons we'll start adding stages inside this array.
*/



/*
===============================================================================
Think of it like a workflow
===============================================================================

Collection

↓

Stage 1

↓

Stage 2

↓

Stage 3

↓

Final Result

Each stage performs ONE job.

Small steps.

Simple logic.

Powerful results.
*/



/*
===============================================================================
Upcoming Stages
===============================================================================

✅ $match

Filters documents.

--------------------------------------------------

✅ $project

Selects or reshapes fields.

--------------------------------------------------

✅ $group

Groups documents and performs calculations.

--------------------------------------------------

✅ $sort

Sorts documents.

--------------------------------------------------

✅ $limit

Limits the number of documents.

--------------------------------------------------

✅ $lookup

Joins data from another collection.

--------------------------------------------------

✅ $unwind

Breaks arrays into individual documents.

We'll learn each of these one by one.
*/



/*
===============================================================================
Biggest Takeaway
===============================================================================

find()

↓

Retrieves documents.

--------------------------------------------------

aggregate()

↓

Processes documents.

--------------------------------------------------

Whenever I need reports, analytics, summaries,
calculations or transformations,

Aggregation is the right tool.
*/