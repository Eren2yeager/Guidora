import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Course from '@/models/Course';
import Career from '@/models/Career';
import Program from '@/models/DegreeProgram';
import QuizQuestion from '@/models/QuizQuestion';
import Recommendation from '@/models/Recemondation';
import QuizResult from '@/models/QuizResult';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.js';
import Exam from '@/models/Exam';
import Interest from '@/models/Interest';
import College from '@/models/College';
import mongoose from 'mongoose';

// POST /api/recommendations - Get recommendations based on quiz results
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate fields (accept topCategories OR categoryScores)
    if (!data.quizType) {
      return NextResponse.json({ error: 'quizType is required' }, { status: 400 });
    }
    
    await connectMongo();
    
    // Resolve quizResult from resultId if provided
    let resolvedQuizResult = null;
    if (!data.quizResultId && data.resultId) {
      resolvedQuizResult = await QuizResult.findOne({ resultId: data.resultId })
        .select('_id userId quizType results')
        .lean();
      if (resolvedQuizResult) {
        data.quizResultId = resolvedQuizResult._id?.toString?.() || resolvedQuizResult._id;
        if (!data.categoryScores && !data.results) {
          data.results = resolvedQuizResult.results;
        }
      }
    }

    // Compute topCategories if not provided using categoryScores (object or array)
    let topCategories = Array.isArray(data.topCategories) ? data.topCategories : null;
    if (!topCategories || topCategories.length === 0) {
      const scores = data.categoryScores || data.results || (resolvedQuizResult?.results || {});
      let entries = [];
      if (Array.isArray(scores)) {
        entries = scores.map((s) => ({ category: s.category, score: s.average ?? s.score ?? s.value ?? 0 }));
      } else if (scores && typeof scores === 'object') {
        entries = Object.entries(scores).map(([category, score]) => ({ category, score: Number(score) || 0 }));
      }
      entries.sort((a, b) => (b.score || 0) - (a.score || 0));
      topCategories = entries.slice(0, 3).map((e) => e.category);
    }

    // Guard: if still empty
    if (!topCategories || topCategories.length === 0) {
      return NextResponse.json({ courses: [], careers: [], programs: [] });
    }

    // Map high-level categories to question option tags
    const categoryToTags = {
      STEM: ['technology', 'mathematics', 'science', 'engineering'],
      Arts: ['arts', 'design', 'fine arts', 'literature'],
      Medical: ['healthcare', 'medical', 'biology', 'medicine'],
      Engineering: ['engineering'],
      Social: ['social', 'psychology', 'sociology'],
      Humanities: ['humanities', 'history', 'philosophy', 'literature'],
      Law: ['law', 'legal'],
      Business: ['business', 'finance', 'commerce', 'entrepreneurship'],
      Technology: ['technology', 'computer', 'software', 'it', 'information technology'],
      Science: ['science', 'biology', 'physics', 'chemistry'],
      Education: ['education', 'teaching'],
      Management: ['management', 'operations', 'project management']
    };

    const tags = new Set();
    for (const cat of topCategories) {
      (categoryToTags[cat] || []).forEach((t) => tags.add(t));
    }
    const tagList = Array.from(tags);

    // Pull related IDs from QuizQuestion via option tags (primary for interest), fallback by category type
    const questionFilter = tagList.length > 0
      ? { isActive: true, category: 'interest', 'options.tags': { $in: tagList } }
      : { isActive: true, category: 'interest' };

    const linkingQuestions = await QuizQuestion.find(questionFilter)
      .select('relatedCourses relatedCareers relatedStreams interestTags')
      .lean();

    const courseIds = new Set();
    const careerIds = new Set();
    const programCourseIds = new Set();
    const streamIds = new Set();
    const interestIds = new Set();

    for (const q of linkingQuestions) {
      (q.relatedCourses || []).forEach((id) => { courseIds.add(id?.toString?.() || id); programCourseIds.add(id?.toString?.() || id); });
      (q.relatedCareers || []).forEach((id) => careerIds.add(id?.toString?.() || id));
      (q.relatedStreams || []).forEach((id) => streamIds.add(id?.toString?.() || id));
      (q.interestTags || []).forEach((id) => interestIds.add(id?.toString?.() || id));
    }

    // Fetch entities from DB
    const courses = await Course.find({ _id: { $in: Array.from(courseIds) }, isActive: true })
      .select('name description streamId media iconUrl')
      .limit(20)
      .lean();

    const careers = await Career.find({ _id: { $in: Array.from(careerIds) }, isActive: true })
      .select('name description sectors media')
      .limit(20)
      .lean();

    const programs = await Program.find({ courseId: { $in: Array.from(programCourseIds) }, isActive: true })
      .select('name code courseId collegeId durationYears')
      .limit(20)
      .lean();

    // Exams via courses, careers, and interests
    const exams = await Exam.find({
      isActive: true,
      $or: [
        { courses: { $in: Array.from(courseIds) } },
        { careers: { $in: Array.from(careerIds) } },
        { interestTags: { $in: Array.from(interestIds) } },
      ],
    })
      .select('name examType level region applicationStart applicationEnd examDate link')
      .limit(20)
      .lean();

    // Interests
    const interests = await Interest.find({ _id: { $in: Array.from(interestIds) }, isActive: true })
      .select('name slug description media')
      .limit(20)
      .lean();

    // Colleges via programs, courses, and streams
    const collegeFilter = {
      isActive: true,
      $or: [
        { degreePrograms: { $in: programs.map((p) => p._id).filter(Boolean) } },
        { courses: { $in: Array.from(courseIds) } },
        { streams: { $in: Array.from(streamIds) } },
      ],
    };
    const colleges = await College.find(collegeFilter)
      .select('name code address media streams')
      .limit(20)
      .lean();

    // Generate explanations for recommendations
    const generateExplanation = (type, item, matchedTags) => {
      const reasons = [];
      if (matchedTags && matchedTags.length > 0) {
        reasons.push(`Matches your interests in ${matchedTags.slice(0, 2).join(' and ')}`);
      }
      if (topCategories && topCategories.length > 0) {
        reasons.push(`Aligns with your ${topCategories[0]} quiz results`);
      }
      return reasons.length > 0 ? reasons.join('. ') : `Recommended based on your profile`;
    };

    // Normalize payload for UI with explanations
    const normalized = {
      courses: courses.map((c) => ({
        id: c._id?.toString?.() || c._id,
        title: c.name,
        description: c.description || '',
        streamId: c.streamId,
        media: c.media || {},
        explanation: generateExplanation('course', c, tagList.slice(0, 2))
      })),
      careers: careers.map((c) => ({
        id: c._id?.toString?.() || c._id,
        title: c.name,
        description: c.description || '',
        sectors: c.sectors || [],
        explanation: generateExplanation('career', c, tagList.slice(0, 2))
      })),
      programs: programs.map((p) => ({
        id: p._id?.toString?.() || p._id,
        title: p.name || p.code,
        description: '',
        courseId: p.courseId,
        collegeId: p.collegeId,
        durationYears: p.durationYears,
      })),
      exams: exams.map((e) => ({
        id: e._id?.toString?.() || e._id,
        name: e.name,
        examType: e.examType,
        level: e.level,
        region: e.region,
        applicationStart: e.applicationStart,
        applicationEnd: e.applicationEnd,
        examDate: e.examDate,
        link: e.link,
      })),
      interests: interests.map((i) => ({
        id: i._id?.toString?.() || i._id,
        name: i.name,
        slug: i.slug,
        description: i.description || '',
        media: i.media || {},
      })),
      colleges: colleges.map((c) => ({
        id: c._id?.toString?.() || c._id,
        name: c.name,
        code: c.code,
        address: c.address,
        media: c.media || {},
        streams: c.streams || [],
      })),
    };

    // Optionally persist Recommendation
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || resolvedQuizResult?.userId || null;
    const quizResultId = data.quizResultId || (resolvedQuizResult?._id?.toString?.() || resolvedQuizResult?._id) || null;

    try {
      if (!userId) {
        throw new Error('skip-persist: missing userId');
      }
      const recDoc = await Recommendation.create({
        _id: new mongoose.Types.ObjectId(),
        userId,
        streams: [],
        courses: (normalized.courses || []).map((c) => ({ courseId: c.id, score: 1 })),
        programs: (normalized.programs || []).map((p) => ({ programId: p.id, score: 1 })),
        scholarships: [],
        ngos: [],
        rationale: `Generated from ${data.quizType} quiz for categories: ${topCategories.join(', ')}`,
        quizResultId: quizResultId || undefined,
      });

      // Back-link QuizResult -> Recommendation if provided
      if (quizResultId) {
        await QuizResult.updateOne(
          { _id: quizResultId },
          { $set: { recommendationId: recDoc._id } }
        );
      }

      return NextResponse.json({ ...normalized, recommendationId: recDoc._id?.toString?.() || recDoc._id });
    } catch (persistErr) {
      // If persistence fails, still return recommendations without ID
      if (String(persistErr?.message || '').startsWith('skip-persist')) {
        return NextResponse.json(normalized);
      }
      console.warn('Recommendation persistence failed:', persistErr);
      return NextResponse.json(normalized);
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
