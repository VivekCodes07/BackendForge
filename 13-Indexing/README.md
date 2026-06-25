# MongoDB Indexing

This folder contains everything I learned about MongoDB Indexing.

When I first started learning indexes, I thought they were just a way to make queries faster. After studying them in depth, I realized indexes affect query performance, sorting, storage usage, write performance, and overall database design.

The goal of this section is not just to learn the syntax of `createIndex()`, but to understand how MongoDB internally uses indexes and how to design indexes for real-world applications like Instagram, Netflix, Amazon, and Udemy.

---

## Topics Covered

### Fundamentals

- Why Indexes Exist
- COLLSCAN vs IXSCAN
- Creating Indexes
- Single Field Indexes
- Compound Indexes
- Unique Indexes

### Query Optimization

- Sorting with Indexes
- Multikey Indexes
- Explain Plans
- Covered Queries
- Index Selectivity

### Index Management

- Managing Indexes
- Index Trade-offs
- TTL Indexes

### Advanced Indexing

- Text Indexes
- Partial Indexes
- Sparse Indexes

### Real-World Design

- Indexing Best Practices
- Designing Indexes Based on Query Patterns
- Common Mistakes
- Performance Considerations

---

## Learning Philosophy

While studying these topics, I tried to understand indexing through real-world examples instead of memorizing commands.

Most examples are inspired by applications like:

- Instagram
- Netflix
- Amazon
- YouTube
- Udemy

The idea is to understand:

> Why an index is needed,
> when an index is useful,
> and when an index can actually hurt performance.

---

## Folder Structure

Each lesson contains:

- A detailed README explaining the concept
- A MongoDB Playground file for hands-on practice
- Real-world examples
- Personal notes and observations

---

## Progress

- [x] Why Indexes Exist
- [x] Creating Indexes
- [x] Single Field Indexes
- [x] Compound Indexes
- [x] Unique Indexes
- [x] Indexes & Sorting
- [x] Multikey Indexes
- [x] Explain Plans
- [x] Covered Queries
- [x] TTL Indexes
- [x] Text Indexes
- [x] Partial Indexes
- [x] Indexing Best Practices

---

## Final Goal

By the end of this section, I should be able to:

- Read query patterns
- Design appropriate indexes
- Analyze query performance using explain plans
- Avoid unnecessary indexes
- Optimize MongoDB applications for real-world workloads