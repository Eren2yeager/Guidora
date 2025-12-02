import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";

import User from "../models/User.js";
import Career from "../models/Career.js";
import College from "../models/College.js";
import CounselorSchema from "../models/CounselorSchema.js";
import Course from "../models/Course.js";
import DegreeProgram from "../models/DegreeProgram.js";
import Exam from "../models/Exam.js";
import Interest from "../models/Interest.js";
import Ngo from "../models/Ngo.js";
import QuizQuestion from "../models/QuizQuestion.js";
import Resource from "../models/Resource.js";
import Scholarship from "../models/Scholarship.js";
import Stream from "../models/Stream.js";
import TimelineEvent from "../models/TimelineEvent.js";
import University from "../models/University.js";
import Recemondation from "../models/Recemondation.js";
import SavedItem from "../models/SavedItem.js";
import QuizResult from "../models/QuizResult.js";
import CounselingBooking from "../models/CounselingBooking.js";
// If Notification and CounselingSession are needed for model dependencies:
import Notification from "../models/Notification.js";
// import CounselingSession from "../models/CounselingSession.js";

const MONGODB_URI = "mongodb+srv://fakespotifydb:fakespotify4321@cluster0.rfshxhr.mongodb.net/GuidoraDB";

const MODELS_DIR = path.resolve("models");
const TEMPLATES_DIR = path.resolve("data/templates");

// Map template file to model name (updated for connected_jk_*.json)
const fileModelMap = {
  "connected_jk_careers_data.json": "Career",
  "connected_jk_colleges_data.json": "College",
  "connected_jk_counselors_data.json": "CounselorSchema",
  "connected_jk_courses_data.json": "Course",
  "connected_jk_degree_programs_data.json": "DegreeProgram",
  "connected_jk_exams_data.json": "Exam",
  "connected_jk_interests_data.json": "Interest",
  "connected_jk_ngos_data.json": "Ngo",
  "connected_jk_quiz_questions_data.json": "QuizQuestion",
  "connected_jk_resources_data.json": "Resource",
  "connected_jk_scholarships_data.json": "Scholarship",
  "connected_jk_streams_data.json": "Stream",
  "connected_jk_timeline_events_data.json": "TimelineEvent",
  "connected_jk_universities_data.json": "University",
  // Special handling for user-controlled data below
  "counseling_bookings.json": "CounselingBooking",
  "quizResults.json": "QuizResult",
  "recemondations.json": "Recemondation",
  "savedItems.json": "SavedItem",
  "users.json": "User",
};

// Helper: Recursively convert _id and *_id fields to ObjectId
function convertIds(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertIds);
  } else if (obj && typeof obj === "object") {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      // Single ObjectId fields
      if (
        (key === "_id" || key.endsWith("Id") || key.endsWith("_id")) &&
        typeof value === "string" &&
        /^[a-fA-F0-9]{24}$/.test(value)
      ) {
        newObj[key] = new mongoose.Types.ObjectId(value);
      } else if (
        Array.isArray(value) &&
        value.every((v) => typeof v === "string" && /^[a-fA-F0-9]{24}$/.test(v))
      ) {
        newObj[key] = value.map((v) => new mongoose.Types.ObjectId(v));
      } else if (Array.isArray(value) || (value && typeof value === "object")) {
        newObj[key] = convertIds(value);
      } else {
        newObj[key] = value;
      }
    }
    return newObj;
  }
  return obj;
}

async function importAll() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Could not connect to MongoDB:", err);
    process.exit(1);
  }

  let files;
  try {
    files = await fs.readdir(TEMPLATES_DIR);
  } catch (err) {
    console.error("❌ Could not read templates directory:", err);
    process.exit(1);
  }

  for (const file of files) {
    if (file === "connected_jk_user_controlled_data.json") {
      // Special handling for user-controlled data
      const filePath = path.join(TEMPLATES_DIR, file);
      let data;
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        data = JSON.parse(raw);
      } catch (e) {
        console.error(`❌ Could not read/parse ${file}:`, e.message);
        continue;
      }
      // Each key in the object is a collection
      const userControlledMap = {
        quiz_results: QuizResult,
        recommendations: Recemondation,
        saved_items: SavedItem,
        counseling_bookings: CounselingBooking,
        notifications: Notification, // Uncomment import if needed
      };
      for (const [key, model] of Object.entries(userControlledMap)) {
        if (!data[key]) continue;
        try {
          await model.deleteMany({});
          console.log(`🧹 Cleared collection for ${key}`);
        } catch (e) {
          console.error(`❌ Error clearing collection for ${key}:`, e.message);
          continue;
        }
        try {
          const docs = Array.isArray(data[key]) ? data[key].map(convertIds) : [convertIds(data[key])];
          await model.insertMany(docs, { ordered: false });
          console.log(`✅ Imported ${docs.length} documents into ${key}`);
        } catch (e) {
          console.error(`❌ Error inserting into ${key}:`, e.message);
        }
      }
      continue;
    }
    const modelName = fileModelMap[file];
    if (!modelName) {
      console.log(`⚠️ Skipping ${file} (no model mapping)`);
      continue;
    }
    let model;
    try {
      model = eval(modelName); // Use imported model directly
    } catch (e) {
      console.error(`❌ Could not resolve model for ${modelName}:`, e.message);
      continue;
    }
    const filePath = path.join(TEMPLATES_DIR, file);
    let data;
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      data = JSON.parse(raw);
    } catch (e) {
      console.error(`❌ Could not read/parse ${file}:`, e.message);
      continue;
    }
    // Convert IDs
    const docs = Array.isArray(data)
      ? data.map(convertIds)
      : [convertIds(data)];
    // Clear collection safely
    try {
      await model.deleteMany({});
      console.log(`🧹 Cleared collection for ${modelName}`);
    } catch (e) {
      console.error(
        `❌ Error clearing collection for ${modelName}:`,
        e.message
      );
      continue;
    }
    // Insert
    try {
      await model.insertMany(docs, { ordered: false });
      console.log(`✅ Imported ${docs.length} documents into ${modelName}`);
    } catch (e) {
      console.error(`❌ Error inserting into ${modelName}:`, e.message);
    }
  }

  try {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Error disconnecting from MongoDB:", err);
  }

  console.log("🎉 All imports complete.");
}

importAll().catch((err) => {
  console.error("🔥 Fatal error during import:", err);
  process.exit(1);
});
// NOTE: To remove ES module warnings, add "type": "module" to your package.json
// NOTE: Remove duplicate index definitions in your models (keep only schema.index())
