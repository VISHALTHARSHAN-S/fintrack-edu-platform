import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Course } from '../models/Course.js';
import { SEEDED_COURSES } from '../seed/coursesSeedData.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/fintrack_edu';

const seedCourses = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    for (const course of SEEDED_COURSES) {
      await Course.updateOne(
        { slug: course.slug },
        { $set: course },
        { upsert: true }
      );
    }

    const courses = await Course.find({ slug: { $in: SEEDED_COURSES.map((course) => course.slug) } })
      .select('_id title slug')
      .sort({ slug: 1 });

    console.log(`[Course Seed] Upserted ${courses.length} courses without deleting existing records.`);
    courses.forEach((course) => console.log(`- ${course.title}: ${course._id} (${course.slug})`));
  } catch (error) {
    console.error(`[Course Seed Error] ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedCourses();