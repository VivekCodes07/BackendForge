/*
===============================================================================
                        PLAYGROUND - $match STAGE
===============================================================================

Today I learned the first stage of the Aggregation Pipeline.

$match

At first glance, it looked exactly like find().

But after understanding Aggregation, I realized something important:

find()

↓

Returns matching documents and stops.

$match

↓

Filters matching documents and passes them
to the next stage of the pipeline.

That's the real difference.
*/


// ============================================================================
// Sample Collection
// ============================================================================

db.courses.drop();

db.courses.insertMany([
    {
        title: "MongoDB Mastery",
        instructor: "Vivek",
        category: "Database",
        price: 4999,
        rating: 4.9,
        studentsEnrolled: 1200,
        isPublished: true
    },
    {
        title: "Node.js Bootcamp",
        instructor: "Akshay",
        category: "Backend",
        price: 3999,
        rating: 4.8,
        studentsEnrolled: 850,
        isPublished: false
    },
    {
        title: "Express.js API",
        instructor: "Vivek",
        category: "Backend",
        price: 2999,
        rating: 4.7,
        studentsEnrolled: 600,
        isPublished: true
    },
    {
        title: "React Complete Guide",
        instructor: "Hitesh",
        category: "Frontend",
        price: 4499,
        rating: 4.9,
        studentsEnrolled: 1600,
        isPublished: true
    },
    {
        title: "Docker Deep Dive",
        instructor: "Akshay",
        category: "DevOps",
        price: 5499,
        rating: 4.8,
        studentsEnrolled: 700,
        isPublished: true
    }
]);



/*
===============================================================================
1. My first aggregation
===============================================================================

Right now the pipeline contains only one stage.

$match

It filters the documents before anything else happens.
*/

db.courses.aggregate([
    {
        $match: {
            category: "Backend"
        }
    }
]);



/*
===============================================================================
2. Isn't this similar to find()?
===============================================================================

Yes...

The filtering syntax is exactly the same.

But find() ends here.

Aggregation doesn't.
*/

db.courses.find({
    category: "Backend"
});



/*
===============================================================================
3. Filter published courses
===============================================================================

Imagine Udemy only wants to show published courses.
*/

db.courses.aggregate([
    {
        $match: {
            isPublished: true
        }
    }
]);



/*
===============================================================================
4. Multiple conditions
===============================================================================

Show only published Backend courses.
*/

db.courses.aggregate([
    {
        $match: {
            category: "Backend",
            isPublished: true
        }
    }
]);



/*
===============================================================================
5. Comparison operators
===============================================================================

Courses that cost more than ₹4000.
*/

db.courses.aggregate([
    {
        $match: {
            price: {
                $gt: 4000
            }
        }
    }
]);



/*
===============================================================================
6. Another comparison example
===============================================================================

Highly rated courses.
*/

db.courses.aggregate([
    {
        $match: {
            rating: {
                $gte: 4.8
            }
        }
    }
]);



/*
===============================================================================
7. Think like a real application
===============================================================================

Suppose I'm building Udemy.

A student opens the "Backend" section.

Should MongoDB process every course first?

No.

It should immediately remove:

❌ Frontend
❌ Database
❌ DevOps

Only Backend courses should continue.

That's why $match is usually the FIRST stage.
*/



/*
===============================================================================
Mental Model
===============================================================================

Collection

↓

$match

↓

Remaining Documents

↓

Next Stage

Every stage after $match has fewer documents to process.

Less work.

Better performance.
*/



/*
===============================================================================
Biggest Takeaway
===============================================================================

Whenever I see:

{
    $match: { ... }
}

I don't think:

"Find these documents."

I think:

"Only allow these documents to continue
through the aggregation pipeline."

That's what makes $match different from find().
*/