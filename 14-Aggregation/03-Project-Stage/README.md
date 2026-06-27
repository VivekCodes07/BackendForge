# `$project` Stage

## Why Am I Learning This?

In the previous lesson, I learned how `$match` filters documents before they move further into the pipeline.

But after filtering, another question came into my mind.

Do I always need the **entire document**?

Most of the time...

No.

Imagine I'm building Udemy.

The course document stored in MongoDB looks like this:

```javascript
{
    title: "MongoDB Mastery",
    instructor: "Vivek",
    category: "Database",
    price: 4999,
    studentsEnrolled: 1200,
    rating: 4.9,
    duration: 18,
    language: "English",
    isPublished: true,
    createdAt: ISODate("2025-01-12")
}
```

Now imagine I'm building the course listing page.

Do I really need:

* `createdAt`
* `isPublished`
* `language`
* `duration`

Probably not.

The frontend only wants:

* Course title
* Instructor
* Price
* Rating

Everything else is unnecessary.

That's exactly why `$project` exists.

---

# What Does `$project` Do?

The easiest way I can explain it to myself is:

> `$project` decides what the final document should look like.

It can:

* Include fields
* Exclude fields
* Rename fields
* Create completely new fields

Instead of changing the actual document stored in MongoDB,

it only changes the document that's returned by the pipeline.

The original document remains untouched.

---

# My First `$project`

Suppose I only want:

* title
* instructor
* price

```javascript
db.courses.aggregate([
    {
        $project: {
            title: 1,
            instructor: 1,
            price: 1
        }
    }
])
```

MongoDB returns:

```javascript
{
    title: "MongoDB Mastery",
    instructor: "Vivek",
    price: 4999
}
```

Notice what disappeared.

Everything else.

MongoDB simply left those fields out.

---

# What Does `1` Mean?

When I first saw this:

```javascript
{
    title: 1
}
```

I wondered...

Why `1`?

It simply means:

```text
Include this field.
```

Similarly,

```javascript
{
    title: 0
}
```

means:

```text
Exclude this field.
```

---

# Hiding Fields

Suppose I don't care about `createdAt`.

```javascript
db.courses.aggregate([
    {
        $project: {
            createdAt: 0
        }
    }
])
```

Everything comes back except `createdAt`.

Simple.

---

# The `_id` Surprise

One thing confused me immediately.

I wrote:

```javascript
db.courses.aggregate([
    {
        $project: {
            title: 1,
            instructor: 1
        }
    }
])
```

Output:

```javascript
{
    _id: ObjectId(...),
    title: "MongoDB Mastery",
    instructor: "Vivek"
}
```

Wait...

Why is `_id` still here?

Because MongoDB includes `_id` by default.

If I don't want it,

I must explicitly remove it.

```javascript
db.courses.aggregate([
    {
        $project: {
            _id: 0,
            title: 1,
            instructor: 1
        }
    }
])
```

Now `_id` disappears.

---

# Renaming Fields

Suppose the frontend doesn't want:

```javascript
studentsEnrolled
```

Instead,

it wants:

```javascript
totalStudents
```

Easy.

```javascript
db.courses.aggregate([
    {
        $project: {
            title: 1,
            totalStudents: "$studentsEnrolled"
        }
    }
])
```

MongoDB returns:

```javascript
{
    title: "MongoDB Mastery",
    totalStudents: 1200
}
```

The database didn't change.

Only the output changed.

---

# Creating New Fields

This was the coolest part for me.

Suppose I want to display:

```text
Premium Course
```

for every course.

```javascript
db.courses.aggregate([
    {
        $project: {
            title: 1,
            label: "Premium Course"
        }
    }
])
```

Or later,

I can calculate fields dynamically using aggregation operators.

This is where `$project` starts becoming really powerful.

---

# Real World Example — Netflix

Imagine Netflix stores:

```javascript
{
    title: "Stranger Things",
    genre: "Sci-Fi",
    seasons: 5,
    rating: 9.0,
    budget: 300000000,
    internalNotes: "Confidential"
}
```

When users browse Netflix,

should MongoDB send:

```text
budget
internalNotes
```

Of course not.

Instead,

`$project` returns only:

```javascript
{
    title,
    genre,
    rating,
    seasons
}
```

Exactly what the frontend needs.

Nothing more.

Nothing less.

---

# Think Of `$project` Like Packing A Bag

Imagine I'm going on a weekend trip.

My cupboard has:

* Winter Jacket
* Laptop
* Charger
* Books
* Football
* Passport
* Shoes
* Camera

Do I carry everything?

No.

I only pack what I actually need.

That's exactly what `$project` does.

It packs only the required fields before sending the document.

---

# Combining `$match` And `$project`

Now I finally understand why aggregation is called a pipeline.

```javascript
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
            price: 1
        }
    }
])
```

Read it like English:

```text
Step 1

Keep only Backend courses.

↓

Step 2

Return only title,
instructor and price.
```

This already feels like building a workflow.

---

# My Mental Model

Whenever I see:

```javascript
{
    $project: { ... }
}
```

I don't think:

> "Projection."

I think:

> "How should my final document look?"

That's literally its job.

---

# Quick Revision

`$project` is used to:

* Include fields
* Exclude fields
* Hide `_id`
* Rename fields
* Create new fields
* Shape the final output

Remember:

```javascript
1
```

means:

```text
Include
```

```javascript
0
```

means:

```text
Exclude
```

---

# Most Important Thing I Learned

`$match` decides:

> Which documents should continue?

`$project` decides:

> What those documents should look like.

Together, they already make Aggregation feel incredibly powerful.

One stage filters the data.

The next stage shapes the data.

And this is only the beginning.
