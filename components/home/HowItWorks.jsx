'use client';

import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    {
      title: 'Deciding what to study?',
      description: 'Take our personalized quiz to discover courses and careers that match your interests, skills, and goals.',
      image: '/images/deciding.svg',
      color: 'pink',
    },
    {
      title: 'Looking for scholarships?',
      description: 'Browse through hundreds of scholarships and financial aid options filtered by your eligibility criteria.',
      image: '/images/scholarship.svg',
      color: 'purple',
    },
    {
      title: 'Ready for university?',
      description: 'Compare colleges, explore admission requirements, and get application guidance all in one place.',
      image: '/images/university.svg',
      color: 'blue',
    },
  ];

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">How we can help</h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Your educational journey made simple with personalized guidance
          </p>
        </div>

        <div className="mt-16">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div 
                key={step.title}
                className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center`}
              >
                <motion.div 
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex-1"
                >
                  <div className={`bg-gray-100 rounded-lg p-8 flex justify-center`}>
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="max-h-64 w-auto"
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex-1 mt-10 lg:mt-0 lg:ml-10 lg:mr-10"
                >
                  <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-4 text-lg text-gray-500">{step.description}</p>
                  <div className="mt-6">
                    <a
                      href="#"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Learn more
                    </a>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}