import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Course from '@/models/Course';
import Career from '@/models/Career';
import Program from '@/models/DegreeProgram';

// POST /api/recommendations - Get recommendations based on quiz results
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.quizType || !data.topCategories || !Array.isArray(data.topCategories)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    await connectMongo();
    
    // Get recommendations based on top categories
    const { quizType, topCategories } = data;
    
    // For now, we'll use mock data for recommendations
    // In a real implementation, you would query your database for matching items
    const recommendations = await getMockRecommendations(quizType, topCategories);
    
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

// Helper function to get mock recommendations
// In a real implementation, this would query your database
async function getMockRecommendations(quizType, topCategories) {
  // Mock data for recommendations
  const mockCourses = [
    {
      id: 'course-1',
      title: 'Introduction to Computer Science',
      description: 'Learn the fundamentals of computer science and programming.',
      category: 'STEM',
    },
    {
      id: 'course-2',
      title: 'Creative Writing Workshop',
      description: 'Develop your creative writing skills across various genres.',
      category: 'Arts',
    },
    {
      id: 'course-3',
      title: 'Human Anatomy and Physiology',
      description: 'Explore the structure and function of the human body.',
      category: 'Medical',
    },
    {
      id: 'course-4',
      title: 'Introduction to Engineering',
      description: 'Learn the basics of engineering principles and problem-solving.',
      category: 'Engineering',
    },
    {
      id: 'course-5',
      title: 'Psychology 101',
      description: 'Understand the basics of human behavior and mental processes.',
      category: 'Social',
    },
    {
      id: 'course-6',
      title: 'World Literature',
      description: 'Explore literary masterpieces from around the world.',
      category: 'Humanities',
    },
    {
      id: 'course-7',
      title: 'Introduction to Legal Studies',
      description: 'Learn the fundamentals of law and legal systems.',
      category: 'Law',
    },
    {
      id: 'course-8',
      title: 'Business Management Fundamentals',
      description: 'Understand the core principles of business management.',
      category: 'Business',
    },
    {
      id: 'course-9',
      title: 'Web Development Bootcamp',
      description: 'Learn to build modern web applications from scratch.',
      category: 'Technology',
    },
    {
      id: 'course-10',
      title: 'Environmental Science',
      description: 'Study the environment and how it works.',
      category: 'Science',
    },
    {
      id: 'course-11',
      title: 'Educational Psychology',
      description: 'Learn how people learn and develop teaching strategies.',
      category: 'Education',
    },
    {
      id: 'course-12',
      title: 'Project Management',
      description: 'Learn to plan, execute, and complete projects efficiently.',
      category: 'Management',
    },
  ];
  
  const mockCareers = [
    {
      id: 'career-1',
      title: 'Software Developer',
      description: 'Design, develop, and maintain software applications.',
      category: 'STEM',
    },
    {
      id: 'career-2',
      title: 'Graphic Designer',
      description: 'Create visual concepts to communicate ideas.',
      category: 'Arts',
    },
    {
      id: 'career-3',
      title: 'Physician',
      description: 'Diagnose and treat illnesses and injuries.',
      category: 'Medical',
    },
    {
      id: 'career-4',
      title: 'Civil Engineer',
      description: 'Design and oversee construction of infrastructure projects.',
      category: 'Engineering',
    },
    {
      id: 'career-5',
      title: 'Social Worker',
      description: 'Help people solve and cope with problems in their everyday lives.',
      category: 'Social',
    },
    {
      id: 'career-6',
      title: 'Historian',
      description: 'Study and interpret the past through research.',
      category: 'Humanities',
    },
    {
      id: 'career-7',
      title: 'Attorney',
      description: 'Represent and advise clients on legal matters.',
      category: 'Law',
    },
    {
      id: 'career-8',
      title: 'Marketing Manager',
      description: 'Develop marketing strategies to promote products or services.',
      category: 'Business',
    },
    {
      id: 'career-9',
      title: 'Data Scientist',
      description: 'Analyze and interpret complex data to inform business decisions.',
      category: 'Technology',
    },
    {
      id: 'career-10',
      title: 'Biologist',
      description: 'Study living organisms and their relationship to the environment.',
      category: 'Science',
    },
    {
      id: 'career-11',
      title: 'Teacher',
      description: 'Educate students in various subjects and grade levels.',
      category: 'Education',
    },
    {
      id: 'career-12',
      title: 'Operations Manager',
      description: 'Oversee the production of goods or services.',
      category: 'Management',
    },
  ];
  
  const mockPrograms = [
    {
      id: 'program-1',
      title: 'Computer Science Degree',
      description: 'Bachelor of Science in Computer Science.',
      category: 'STEM',
    },
    {
      id: 'program-2',
      title: 'Fine Arts Degree',
      description: 'Bachelor of Fine Arts with specializations in various media.',
      category: 'Arts',
    },
    {
      id: 'program-3',
      title: 'Pre-Medicine Program',
      description: 'Preparatory program for medical school.',
      category: 'Medical',
    },
    {
      id: 'program-4',
      title: 'Engineering Degree',
      description: 'Bachelor of Engineering with various specializations.',
      category: 'Engineering',
    },
    {
      id: 'program-5',
      title: 'Social Sciences Degree',
      description: 'Bachelor of Arts in Social Sciences.',
      category: 'Social',
    },
    {
      id: 'program-6',
      title: 'Liberal Arts Degree',
      description: 'Bachelor of Arts in Liberal Arts and Humanities.',
      category: 'Humanities',
    },
    {
      id: 'program-7',
      title: 'Law School',
      description: 'Juris Doctor (JD) program.',
      category: 'Law',
    },
    {
      id: 'program-8',
      title: 'Business Administration Degree',
      description: 'Bachelor of Business Administration.',
      category: 'Business',
    },
    {
      id: 'program-9',
      title: 'Information Technology Degree',
      description: 'Bachelor of Science in Information Technology.',
      category: 'Technology',
    },
    {
      id: 'program-10',
      title: 'Biology Degree',
      description: 'Bachelor of Science in Biology.',
      category: 'Science',
    },
    {
      id: 'program-11',
      title: 'Education Degree',
      description: 'Bachelor of Education.',
      category: 'Education',
    },
    {
      id: 'program-12',
      title: 'Business Management Degree',
      description: 'Bachelor of Science in Business Management.',
      category: 'Management',
    },
  ];
  
  // Filter recommendations based on top categories
  const filteredCourses = mockCourses.filter(course => 
    topCategories.includes(course.category)
  );
  
  const filteredCareers = mockCareers.filter(career => 
    topCategories.includes(career.category)
  );
  
  const filteredPrograms = mockPrograms.filter(program => 
    topCategories.includes(program.category)
  );
  
  return {
    courses: filteredCourses,
    careers: filteredCareers,
    programs: filteredPrograms,
  };
}