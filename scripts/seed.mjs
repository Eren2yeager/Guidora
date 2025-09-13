import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import mongoose from 'mongoose';
import College from '../models/College.js';
import Stream from '../models/Stream.js';
import Course from '../models/Course.js';
import DegreeProgram from '../models/DegreeProgram.js';
import 'dotenv/config';

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cols[i] || ''));
    return obj;
  });
}

async function readMaybeJSONorCSV(dir, base) {
  const jsonPath = path.join(dir, `${base}.json`);
  const csvPath = path.join(dir, `${base}.csv`);
  try {
    const json = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(json);
    if (!Array.isArray(data)) throw new Error(`${base}.json must be an array`);
    return data;
  } catch {}
  const csv = await fs.readFile(csvPath, 'utf8');
  return parseCsv(csv);
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI not set');
  await mongoose.connect(mongoUri, { bufferCommands: false });

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const templatesDir = path.resolve(__dirname, '../data/templates');

  // 1) Colleges
  const colleges = await readMaybeJSONorCSV(templatesDir, 'colleges');
  const collegeOps = colleges.map((r) => ({
    updateOne: {
      filter: { code: r.code },
      update: {
        $set: {
          name: r.name,
          code: r.code,
          type: r.type || 'Government',
          affiliation: r.affiliation || '',
          address: { line1: r.address || '', district: r.district, state: r.state, pincode: r.pincode || '' },
          location: { type: 'Point', coordinates: [parseFloat(r.lng), parseFloat(r.lat)] },
          facilities: {
            hostel: r.hostel === true || r.hostel === 'true',
            lab: r.lab === true || r.lab === 'true',
            library: r.library === true || r.library === 'true',
            internet: r.internet === true || r.internet === 'true',
            medium: Array.isArray(r.medium) ? r.medium : (r.medium || '').split('|').filter(Boolean),
          },
          contacts: { phone: r.phone || '', email: r.email || '', website: r.website || '' },
          source: r.source || 'seed',
          sourceUrl: r.sourceUrl || '',
          lastUpdated: new Date(),
        },
      },
      upsert: true,
    },
  }));
  if (collegeOps.length) await College.bulkWrite(collegeOps, { ordered: false });

  // 2) Streams baseline
  const streamNames = ['Science', 'Commerce', 'Arts', 'Vocational'];
  for (const name of streamNames) {
    await Stream.findOneAndUpdate({ name }, { $setOnInsert: { name } }, { upsert: true });
  }

  // 3) Courses
  const courses = await readMaybeJSONorCSV(templatesDir, 'courses');
  const streamDocs = await Stream.find({ name: { $in: courses.map((c) => c.stream) } }).lean();
  const streamMap = new Map(streamDocs.map((s) => [s.name, s._id]));
  const courseOps = courses.map((r) => ({
    updateOne: {
      filter: { code: r.code },
      update: {
        $set: {
          code: r.code,
          name: r.name,
          streamId: streamMap.get(r.stream),
          level: r.level || 'UG',
          description: r.description || '',
          eligibility: { minMarks: parseFloat(r.minMarks || '0') || 0, requiredSubjects: Array.isArray(r.requiredSubjects) ? r.requiredSubjects : (r.requiredSubjects || '').split('|').filter(Boolean) },
          outcomes: {
            careers: Array.isArray(r.careers) ? r.careers : (r.careers || '').split('|').filter(Boolean),
            govtExams: Array.isArray(r.govtExams) ? r.govtExams : (r.govtExams || '').split('|').filter(Boolean),
            privateJobs: Array.isArray(r.privateJobs) ? r.privateJobs : (r.privateJobs || '').split('|').filter(Boolean),
            higherStudies: Array.isArray(r.higherStudies) ? r.higherStudies : (r.higherStudies || '').split('|').filter(Boolean),
            entrepreneurship: Array.isArray(r.entrepreneurship) ? r.entrepreneurship : (r.entrepreneurship || '').split('|').filter(Boolean),
          },
          tags: Array.isArray(r.tags) ? r.tags : (r.tags || '').split('|').filter(Boolean),
          media: { iconUrl: r.iconUrl || '', bannerUrl: r.bannerUrl || '' },
          source: r.source || 'seed',
          sourceUrl: r.sourceUrl || '',
          lastUpdated: new Date(),
        },
      },
      upsert: true,
    },
  }));
  if (courseOps.length) await Course.bulkWrite(courseOps, { ordered: false });

  // 4) Programs
  const programs = await readMaybeJSONorCSV(templatesDir, 'programs');
  const collegeDocs = await College.find({ code: { $in: programs.map((p) => p.collegeCode) } }, { _id: 1, code: 1 }).lean();
  const courseDocs = await Course.find({ code: { $in: programs.map((p) => p.courseCode) } }, { _id: 1, code: 1 }).lean();
  const collegeMap = new Map(collegeDocs.map((d) => [d.code, d._id]));
  const courseMap = new Map(courseDocs.map((d) => [d.code, d._id]));

  const programOps = programs.map((r) => ({
    insertOne: {
      document: {
        collegeId: collegeMap.get(r.collegeCode),
        courseId: courseMap.get(r.courseCode),
        durationYears: parseInt(r.durationYears || '3', 10),
        medium: Array.isArray(r.medium) ? r.medium : (r.medium || '').split('|').filter(Boolean),
        intakeMonths: Array.isArray(r.intakeMonths)
          ? r.intakeMonths.map((m) => parseInt(m, 10)).filter((n) => !Number.isNaN(n))
          : (r.intakeMonths || '').split('|').map((m) => parseInt(m, 10)).filter((n) => !Number.isNaN(n)),
        seats: parseInt(r.seats || '0', 10),
        cutoff: { lastYear: parseFloat(r.cutoffLastYear || '0') || 0 },
        fees: {
          tuitionPerYear: parseFloat(r.tuitionPerYear || '0') || 0,
          hostelPerYear: parseFloat(r.hostelPerYear || '0') || 0,
          misc: parseFloat(r.misc || '0') || 0,
          currency: r.currency || 'INR',
        },
        source: r.source || 'seed',
        sourceUrl: r.sourceUrl || '',
        lastUpdated: new Date(),
      },
    },
  }));
  if (programOps.length) await DegreeProgram.bulkWrite(programOps, { ordered: false });

  console.log('Seeding done');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});