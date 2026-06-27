# `$group` Stage

## Why Am I Learning This?

So far, I've learned two aggregation stages.

* `$match` decides **which documents** should continue.
* `$project` decides **what those documents** should look like.

Both are useful.

But neither of them answers business questions.

Imagine I'm building **YouTube Studio**.

A creator logs in and sees analytics like:

* Total videos uploaded
* Total views
* Total likes
* Average views per video
* Most popular category

Where does all this information come from?

It isn't stored directly inside MongoDB.

MongoDB has to calculate it.

That's exactly why the `$group` stage exists.

---

# Let's Think Like YouTube

Suppose YouTube stores videos like this.

```javascript
db.videos.insertMany([
    {
        title: "MongoDB Indexing",
        category: "Database",
        views: 180000,
        likes: 12000,
        creator: "Vivek"
    },
    {
        title: "Aggregation Pipeline",
        category: "Database",
        views: 150000,
        likes: 9800,
        creator: "Vivek"
    },
    {
        title: "React Basics",
        category: "Frontend",
        views: 90000,
        likes: 7000,
        creator: "Alex"
    },
    {
        title: "Node.js Crash Course",
        category: "Backend",
        views: 210000,
        likes: 15000,
        creator: "Akshay"
    }
])
```

Now imagine YouTube asks:

> "How many videos belong to each category?"

Look carefully.

No document contains that answer.

MongoDB has to calculate it.

---

# What Does `$group` Do?

The easiest way I can explain it to myself is:

> `$group` collects documents into groups and performs calculations on each group.

Think of a classroom.

Instead of looking at every student individually,

the teacher groups them by section.

Section A

↓

40 Students

Section B

↓

35 Students

Section C

↓

42 Students

That's exactly what `$group` does with documents.

---

# My First `$group`

```javascript
db.videos.aggregate([
    {
        $group: {
            _id: "$category"
        }
    }
])
```

Output:

```javascript
[
    {
        _id: "Backend"
    },
    {
        _id: "Database"
    },
    {
        _id: "Frontend"
    }
]
```

Wait...

Where did `category` go?

Why is everything inside `_id`?

---

# Why `_id`?

This confused me a lot.

Inside `$group`,

`_id` does **not** mean MongoDB's document ID.

Instead,

it means:

> "Group documents based on this field."

So this:

```javascript
_id: "$category"
```

actually means:

```text
Group all documents that have the same category.
```

That's all.

---

# Counting Documents

Grouping alone isn't very useful.

Usually, I want calculations too.

Suppose YouTube asks:

> "How many videos belong to each category?"

```javascript
db.videos.aggregate([
    {
        $group: {
            _id: "$category",
            totalVideos: {
                $sum: 1
            }
        }
    }
])
```

Output:

```javascript
[
    {
        _id: "Database",
        totalVideos: 2
    },
    {
        _id: "Backend",
        totalVideos: 1
    },
    {
        _id: "Frontend",
        totalVideos: 1
    }
]
```

---

# Why `$sum: 1`?

This looked strange at first.

Why add `1`?

Because MongoDB adds **one** for every document inside the group.

Imagine Database has:

```
Video 1

+

Video 2
```

MongoDB calculates:

```
1 + 1 = 2
```

That's why:

```javascript
$sum: 1
```

counts documents.

---

# Total Views Per Category

Suppose YouTube wants:

> "How many total views does each category have?"

Now we're not counting documents.

We're adding views.

```javascript
db.videos.aggregate([
    {
        $group: {
            _id: "$category",
            totalViews: {
                $sum: "$views"
            }
        }
    }
])
```

MongoDB now adds the value of the `views` field.

Much more useful.

---

# Average Views

Another common business question.

> "What's the average number of views per category?"

```javascript
db.videos.aggregate([
    {
        $group: {
            _id: "$category",
            averageViews: {
                $avg: "$views"
            }
        }
    }
])
```

MongoDB calculates everything automatically.

No JavaScript required.

---

# Highest Viewed Video

Suppose I only want the highest number of views in each category.

```javascript
db.videos.aggregate([
    {
        $group: {
            _id: "$category",
            highestViews: {
                $max: "$views"
            }
        }
    }
])
```

Similarly,

Lowest:

```javascript
$min
```

Average:

```javascript
$avg
```

Count:

```javascript
$sum: 1
```

Total:

```javascript
$sum: "$field"
```

These are called **accumulators** because they accumulate values while MongoDB processes each group.

---

# Think Of `$group` Like A Teacher

Imagine a teacher has marks of every student.

Instead of reading one student's marks at a time,

the teacher creates groups.

Class A

↓

Average Marks

Highest Marks

Lowest Marks

Number Of Students

That's exactly what `$group` does.

It summarizes information.

---

# Combining Stages

Now Aggregation finally starts feeling powerful.

Suppose YouTube wants:

> "Show total views only for Database videos."

```javascript
db.videos.aggregate([
    {
        $match: {
            category: "Database"
        }
    },
    {
        $group: {
            _id: "$creator",
            totalViews: {
                $sum: "$views"
            }
        }
    }
])
```

Read it like English.

Step 1

Keep only Database videos.

↓

Step 2

Group them by creator.

↓

Step 3

Calculate total views.

That's exactly how real analytics pipelines work.

---

# My Mental Model

Whenever I see:

```javascript
{
    $group: { ... }
}
```

I don't think:

> "Grouping."

I think:

> "Take similar documents, put them into buckets, and calculate something for each bucket."

That's exactly what MongoDB is doing.

---

# Quick Revision

`$group` is used to:

* Group similar documents
* Count documents
* Calculate totals
* Calculate averages
* Find minimum values
* Find maximum values
* Build reports
* Generate analytics

The most common accumulators are:

| Accumulator | Purpose               |
| ----------- | --------------------- |
| `$sum`      | Count or total values |
| `$avg`      | Average values        |
| `$min`      | Smallest value        |
| `$max`      | Largest value         |

---

# Most Important Thing I Learned

This is the first stage where I truly felt the power of Aggregation.

Before learning `$group`, MongoDB mostly helped me retrieve data.

Now it can answer business questions.

Instead of asking:

> "Give me the documents."

I'm asking:

> "Tell me what these documents mean."

And that's exactly what real-world analytics is all about.
