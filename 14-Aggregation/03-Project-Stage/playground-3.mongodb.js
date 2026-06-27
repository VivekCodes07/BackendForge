/*
===============================================================================
                        PLAYGROUND - $project STAGE
===============================================================================

Today I learned about the $project stage.

$match answers:

    "Which documents should continue?"

$project answers:

    "What should those documents look like?"

It doesn't modify the actual documents stored in MongoDB.

It only changes the shape of the documents
returned by the aggregation pipeline.
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
        duration: 18,
        language: "English",
        isPublished: true
    },
    {
        title: "Node.js Bootcamp",
        instructor: "Akshay",
        category: "Backend",
        price: 3999,
        rating: 4.8,
        studentsEnrolled: 850,
        duration: 20,
        language: "English",
        isPublished: true
    },
    {
        title: "React Complete Guide",
        instructor: "Hitesh",
        category: "Frontend",
        price: 4499,
        rating: 4.9,
        studentsEnrolled: 1600,
        duration: 22,
        language: "English",
        isPublished: false
    }
]);



/*
===============================================================================
1. Return only selected fields
===============================================================================

Suppose I'm building the course listing page.

The frontend doesn't need every field.

It only needs:

• title
• instructor
• price
*/

db.courses.aggregate([
    {
        $project: {
            title: 1,
            instructor: 1,
            price: 1
        }
    }
]);



/*
===============================================================================
2. Hide the _id field
===============================================================================

MongoDB includes _id automatically.

If I don't need it,

I have to exclude it explicitly.
*/

db.courses.aggregate([
    {
        $project: {
            _id: 0,
            title: 1,
            instructor: 1,
            price: 1
        }
    }
]);



/*
===============================================================================
3. Exclude specific fields
===============================================================================

Instead of choosing what to include,

I can remove only the fields I don't want.
*/

db.courses.aggregate([
    {
        $project: {
            duration: 0,
            language: 0
        }
    }
]);



/*
===============================================================================
4. Rename a field
===============================================================================

Suppose the frontend wants:

studentsEnrolled

↓

totalStudents
*/

db.courses.aggregate([
    {
        $project: {
            _id: 0,
            title: 1,
            instructor: 1,
            totalStudents: "$studentsEnrolled"
        }
    }
]);



/*
===============================================================================
5. Create a new field
===============================================================================

I can even create completely new fields.

The original document inside MongoDB
remains unchanged.
*/

db.courses.aggregate([
    {
        $project: {
            _id: 0,
            title: 1,
            instructor: 1,
            label: "Premium Course"
        }
    }
]);



/*
===============================================================================
6. Combine $match and $project
===============================================================================

This feels much closer to a real application.

Step 1

Keep only Backend courses.

↓

Step 2

Return only the required fields.
*/

db.courses.aggregate([
    {
        $match: {
            category: "Backend"
        }
    },
    {
        $project: {
            _id: 0,
            title: 1,
            instructor: 1,
            price: 1,
            rating: 1
        }
    }
]);



/*
===============================================================================
Mental Model
===============================================================================

Collection

↓

$match (optional)

↓

$project

↓

Final Output

$project never changes the documents
stored in MongoDB.

It only changes what gets returned.
*/



/*
===============================================================================
Biggest Takeaway
===============================================================================

Whenever I see:

{
    $project: { ... }
}

I don't think:

"Projection"

I think:

"How should the final document look?"

That's exactly what $project is responsible for.
*/