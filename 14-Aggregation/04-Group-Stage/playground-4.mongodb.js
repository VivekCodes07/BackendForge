/*
===============================================================================
                        PLAYGROUND - $group STAGE
===============================================================================

Today I learned the stage that actually makes Aggregation feel powerful.

$group

Unlike $match or $project,

$group doesn't simply filter or reshape documents.

It summarizes data.

This is the stage that powers dashboards, analytics,
reports and business insights.
*/


// ============================================================================
// Sample Collection
// ============================================================================

db.videos.drop();

db.videos.insertMany([
    {
        title: "MongoDB Indexing",
        creator: "Vivek",
        category: "Database",
        views: 180000,
        likes: 12000
    },
    {
        title: "Aggregation Pipeline",
        creator: "Vivek",
        category: "Database",
        views: 150000,
        likes: 9800
    },
    {
        title: "Node.js Crash Course",
        creator: "Akshay",
        category: "Backend",
        views: 210000,
        likes: 15000
    },
    {
        title: "Express.js API",
        creator: "Akshay",
        category: "Backend",
        views: 95000,
        likes: 7200
    },
    {
        title: "React Basics",
        creator: "Alex",
        category: "Frontend",
        views: 90000,
        likes: 6800
    },
    {
        title: "React Hooks",
        creator: "Alex",
        category: "Frontend",
        views: 135000,
        likes: 9700
    }
]);



/*
===============================================================================
1. My first $group
===============================================================================

Group videos by category.

Notice that no calculations happen yet.

MongoDB simply creates groups.
*/

db.videos.aggregate([
    {
        $group: {
            _id: "$category"
        }
    }
]);



/*
===============================================================================
2. Count videos in each category
===============================================================================

Question:

How many videos belong to each category?

$sum: 1

adds one for every document inside each group.
*/

db.videos.aggregate([
    {
        $group: {
            _id: "$category",
            totalVideos: {
                $sum: 1
            }
        }
    }
]);



/*
===============================================================================
3. Total views per category
===============================================================================

Instead of counting documents,

sum the value of the views field.
*/

db.videos.aggregate([
    {
        $group: {
            _id: "$category",
            totalViews: {
                $sum: "$views"
            }
        }
    }
]);



/*
===============================================================================
4. Average views per category
===============================================================================

Useful for analytics dashboards.
*/

db.videos.aggregate([
    {
        $group: {
            _id: "$category",
            averageViews: {
                $avg: "$views"
            }
        }
    }
]);



/*
===============================================================================
5. Highest viewed video in each category
===============================================================================

Find the maximum number of views.
*/

db.videos.aggregate([
    {
        $group: {
            _id: "$category",
            highestViews: {
                $max: "$views"
            }
        }
    }
]);



/*
===============================================================================
6. Lowest viewed video in each category
===============================================================================

Find the minimum number of views.
*/

db.videos.aggregate([
    {
        $group: {
            _id: "$category",
            lowestViews: {
                $min: "$views"
            }
        }
    }
]);



/*
===============================================================================
7. Group by creator
===============================================================================

Imagine YouTube Studio wants analytics
for every creator.
*/

db.videos.aggregate([
    {
        $group: {
            _id: "$creator",
            totalVideos: {
                $sum: 1
            },
            totalViews: {
                $sum: "$views"
            },
            averageViews: {
                $avg: "$views"
            }
        }
    }
]);



/*
===============================================================================
8. Combine $match and $group
===============================================================================

Real-world example:

Only analyze Backend videos.

Step 1

Filter Backend videos.

↓

Step 2

Group them by creator.

↓

Step 3

Calculate total views.
*/

db.videos.aggregate([
    {
        $match: {
            category: "Backend"
        }
    },
    {
        $group: {
            _id: "$creator",
            totalViews: {
                $sum: "$views"
            },
            totalVideos: {
                $sum: 1
            }
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

$group

↓

Analytics / Summary

Instead of returning raw documents,

MongoDB now returns meaningful information.
*/



/*
===============================================================================
Common Accumulators
===============================================================================

$sum    → Count documents or total values

$avg    → Average values

$max    → Highest value

$min    → Lowest value

These operators work inside $group
to calculate results for each group.
*/



/*
===============================================================================
Biggest Takeaway
===============================================================================

Whenever I see:

{
    $group: { ... }
}

I don't think:

"Group these documents."

I think:

"Create buckets of similar documents
and calculate something for each bucket."

That's what makes $group one of the
most powerful stages in the aggregation pipeline.
*/