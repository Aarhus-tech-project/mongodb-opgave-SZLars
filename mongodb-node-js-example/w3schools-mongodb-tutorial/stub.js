// W3schools MongoDB tutorial
// https://www.w3schools.com/mongodb/index.php

// Install Docker Desktop:
// winget install Docker.DockerDesktop

// Install Node.js:
// npm init -y
// npm install mongodb

// Run Docker Desktop:
// docker run --name mongodb -d -p 27017:27017 mongo:latest

// Run Node.js example:
// node stub.js

const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017/';
const client = new MongoClient(url);
const dbName = 'school';
const collectionName = 'students';

async function main() {
    // Connect to db
    try {
        await client.connect();
        console.log('Connected successfully to server');
    } catch (err) {
        console.error('CRITICAL: Could not connect to database.', err);
        return;
    }

    // Db operations
    try {
        const db = client.db(dbName);

        // Create collection (if not exists)
        const existingCollections = await db.listCollections({ name: collectionName }).toArray();
        if (existingCollections.length === 0) {
            await db.createCollection(collectionName);
            console.log(`Collection created: ${collectionName}`);
        } else {
            console.log(`Collection exists: ${collectionName}`);
        }

        const collection = db.collection(collectionName);

        // Clean up: delete all documents to start fresh for examples
        await collection.deleteMany({});
        console.log('Cleared collection for demo');

        // Insert one
        const insertOneResult = await collection.insertOne({
            name: 'John Doe',
            age: 25,
            major: 'Computer Science',
            enrolled: true,
            tags: ['cs', 'undergrad']
        });
        console.log('Inserted one document id:', insertOneResult.insertedId);

        // Insert many
        const insertManyResult = await collection.insertMany([
            { name: 'Alice', age: 22, major: 'Mathematics', enrolled: true, tags: ['math'] },
            { name: 'Bob', age: 27, major: 'History', enrolled: false, tags: [] },
            { name: 'Carol', age: 23, major: 'Computer Science', enrolled: true, tags: ['cs'] },
            { name: 'Dave', age: 29, major: 'Physics', enrolled: false, tags: ['physics'] },
            { name: 'Eve', age: 21, major: 'Chemistry', enrolled: true, tags: ['chem'] }
        ]);
        console.log('Inserted many count:', insertManyResult.insertedCount);

        // Find one
        const findOneResult = await collection.findOne({ name: 'John Doe' });
        console.log('Found one:', findOneResult);

        // Find (all)
        const findAllCursor = collection.find({});
        const findAll = await findAllCursor.toArray();
        console.log('Found all count:', findAll.length);

        // Find with query (filter)
        const findQueryCursor = collection.find({ major: 'Computer Science' });
        const findQuery = await findQueryCursor.toArray();
        console.log('Found by filter (major=Computer Science) count:', findQuery.length);

        // Projection (select specific fields)
        const projectionCursor = collection.find(
            { enrolled: true },
            { projection: { _id: 0, name: 1, age: 1 } }
        );
        const projectionResult = await projectionCursor.toArray();
        console.log('Projection result for enrolled=true:', projectionResult);

        // Sort (ascending age)
        const sortAsc = await collection.find({}, { projection: { _id: 0, name: 1, age: 1 } })
            .sort({ age: 1 })
            .toArray();
        console.log('Sorted ascending by age:', sortAsc);

        // Sort (descending age)
        const sortDesc = await collection.find({}, { projection: { _id: 0, name: 1, age: 1 } })
            .sort({ age: -1 })
            .toArray();
        console.log('Sorted descending by age:', sortDesc);

        // Limit
        const limited = await collection.find({}, { projection: { _id: 0, name: 1 } })
            .limit(3)
            .toArray();
        console.log('Limited to 3:', limited);

        // Update one
        const updateOneResult = await collection.updateOne(
            { name: 'Alice' },
            { $set: { age: 23, enrolled: false } }
        );
        console.log('Update one matched:', updateOneResult.matchedCount, 'modified:', updateOneResult.modifiedCount);

        // Update many
        const updateManyResult = await collection.updateMany(
            { major: 'Computer Science' },
            { $set: { enrolled: true }, $inc: { age: 1 } }
        );
        console.log('Update many matched:', updateManyResult.matchedCount, 'modified:', updateManyResult.modifiedCount);

        // Count documents
        const countAll = await collection.countDocuments();
        console.log('Count all documents:', countAll);

        const countCS = await collection.countDocuments({ major: 'Computer Science' });
        console.log('Count Computer Science:', countCS);

        // Create index
        const indexName = await collection.createIndex({ name: 1 });
        console.log('Created index:', indexName);

        // Delete one
        const deleteOneResult = await collection.deleteOne({ name: 'Bob' });
        console.log('Delete one deletedCount:', deleteOneResult.deletedCount);

        // Delete many
        const deleteManyResult = await collection.deleteMany({ enrolled: false });
        console.log('Delete many (enrolled=false) deletedCount:', deleteManyResult.deletedCount);

        // Aggregate (group by major and count)
        const aggregateCursor = collection.aggregate([
            { $group: { _id: '$major', total: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);
        const aggregateResult = await aggregateCursor.toArray();
        console.log('Aggregate group by major:', aggregateResult);

        // Drop index (cleanup demo)
        await collection.dropIndex(indexName);
        console.log('Dropped index:', indexName);

        // $gt, $lt
        const olderThan22 = await collection.find({ age: { $gt: 22 } }).toArray();
        console.log('$gt age>22 count:', olderThan22.length);

        const ageBetween = await collection.find({ age: { $gt: 21, $lt: 28 } }).toArray();
        console.log('age between (21,28):', ageBetween.length);

        // $in
        const majorsIn = await collection.find({ major: { $in: ['Computer Science', 'Physics'] } }).toArray();
        console.log('$in majors count:', majorsIn.length);

        // $or
        const orQuery = await collection.find({ $or: [{ enrolled: false }, { age: { $lt: 23 } }] }).toArray();
        console.log('$or result count:', orQuery.length);

        // regex
        const regexQuery = await collection.find({ name: { $regex: /^A/i } }).toArray();
        console.log('regex name starts with A count:', regexQuery.length);

        // $exists
        const existsTags = await collection.find({ tags: { $exists: true } }).toArray();
        console.log('$exists tags count:', existsTags.length);

        // ==== EXTRA: Update Operators ====
        // $unset
        const unsetResult = await collection.updateOne({ name: 'John Doe' }, { $unset: { major: '' } });
        console.log('$unset modified:', unsetResult.modifiedCount);

        // $rename
        const renameResult = await collection.updateOne({ name: 'John Doe' }, { $rename: { 'name': 'fullName' } });
        console.log('$rename modified:', renameResult.modifiedCount);

        // $push / $addToSet (array operations)
        const pushResult = await collection.updateOne({ fullName: 'John Doe' }, { $push: { tags: 'alumni' } });
        console.log('$push modified:', pushResult.modifiedCount);

        const addToSetResult = await collection.updateOne({ fullName: 'John Doe' }, { $addToSet: { tags: 'cs' } });
        console.log('$addToSet modified:', addToSetResult.modifiedCount);

        const upsertResult = await collection.updateOne(
            { fullName: 'New Student' },
            { $set: { fullName: 'New Student', age: 20, enrolled: true } },
            { upsert: true }
        );
        console.log('upsert matched:', upsertResult.matchedCount, 'upsertedId:', upsertResult.upsertedId);

        const replaceOneResult = await collection.replaceOne(
            { fullName: 'New Student' },
            { fullName: 'New Student', age: 21, enrolled: false, tags: [] }
        );
        console.log('replaceOne matched:', replaceOneResult.matchedCount, 'modified:', replaceOneResult.modifiedCount);


        const distinctMajors = await collection.distinct('major');
        console.log('distinct majors:', distinctMajors);

        // Create text index on name/fullName and major
        await collection.createIndex({ fullName: 'text', major: 'text' });
        const textSearch = await collection.find({ $text: { $search: 'Computer' } }, { projection: { score: { $meta: 'textScore' }, fullName: 1, major: 1 } })
            .sort({ score: { $meta: 'textScore' } })
            .toArray();
        console.log('text search "Computer" results:', textSearch.map(d => d.fullName ?? d.name));

        // Prepare a second collection for $lookup
        const coursesColName = 'courses';
        const existingCourses = await db.listCollections({ name: coursesColName }).toArray();
        if (existingCourses.length === 0) {
            await db.createCollection(coursesColName);
            console.log(`Collection created: ${coursesColName}`);
        }
        const courses = db.collection(coursesColName);
        await courses.deleteMany({});
        await courses.insertMany([
            { courseId: 1, title: 'Intro to CS', major: 'Computer Science' },
            { courseId: 2, title: 'Advanced Physics', major: 'Physics' },
            { courseId: 3, title: 'History 101', major: 'History' }
        ]);

        const pipeline = [
            { $match: { enrolled: true } },
            { $project: { fullName: { $ifNull: ['$fullName', '$name'] }, major: 1, tags: 1, _id: 0 } },
            { $unwind: { path: '$tags', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: coursesColName,
                    localField: 'major',
                    foreignField: 'major',
                    as: 'courses'
                }
            },
            { $project: { fullName: 1, major: 1, courseTitles: { $map: { input: '$courses', as: 'c', in: '$$c.title' } } } }
        ];
        const lookupAgg = await collection.aggregate(pipeline).toArray();
        console.log('$lookup aggregation:', lookupAgg);

        const validatedColName = 'validated_students';
        const existsValidated = await db.listCollections({ name: validatedColName }).toArray();
        if (existsValidated.length) {
            await db.collection(validatedColName).drop();
        }
        await db.createCollection(validatedColName, {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['fullName', 'age'],
                    properties: {
                        fullName: { bsonType: 'string' },
                        age: { bsonType: 'int', minimum: 16, maximum: 120 },
                        enrolled: { bsonType: 'bool' }
                    }
                }
            }
        });
        console.log('Created collection with $jsonSchema:', validatedColName);

        // Try inserting invalid doc (will fail)
        try {
            await db.collection(validatedColName).insertOne({ fullName: 'Too Young', age: 12 });
        } catch (e) {
            console.log('Validation blocked insert as expected:', e.code ?? e.message);
        }
        // Valid insert
        const validInsert = await db.collection(validatedColName).insertOne({ fullName: 'Valid Student', age: 20, enrolled: true });
        console.log('Validator insert success id:', validInsert.insertedId);


        const renamedColName = 'students_renamed';
        // Ensure target name is free
        const existsRenamed = await db.listCollections({ name: renamedColName }).toArray();
        if (existsRenamed.length) {
            await db.collection(renamedColName).drop();
        }
        await collection.rename(renamedColName);
        console.log('Renamed collection to:', renamedColName);


        const studentsRenamed = db.collection(renamedColName);
        const afterRenameCount = await studentsRenamed.countDocuments();
        console.log('Count after rename:', afterRenameCount);


        const tempDb = client.db('temp_demo_db');
        await tempDb.createCollection('temp');
        await tempDb.collection('temp').insertOne({ hello: 'world' });
        const dropDbResult = await tempDb.dropDatabase();
        console.log('dropDatabase (temp_demo_db) ok:', dropDbResult.ok === 1);

        // Cleanup demo:
        await db.collection(coursesColName).drop();
        await db.collection(validatedColName).drop();

        await studentsRenamed.drop();


        const stillExistsOriginal = await db.listCollections({ name: collectionName }).toArray();
        if (stillExistsOriginal.length) {
            await db.collection(collectionName).drop();
        }

        console.log('Cleanup complete.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        console.log('Closing connection...');
        await client.close();
    }
}

main();