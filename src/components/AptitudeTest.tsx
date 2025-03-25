import React from 'react';
import { ClipboardList, Clock, Brain, BarChart as ChartBar } from 'lucide-react';

const AptitudeTest = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">Career Aptitude Test</h2>
          <p className="mt-4 text-lg text-gray-600">
            Take our comprehensive aptitude test to discover career paths that align with your unique strengths, interests, and personality traits
          </p>
          
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <TestFeature
              icon={Clock}
              title="15-20 minutes to complete"
            />
            <TestFeature
              icon={ClipboardList}
              title="25 multiple-choice questions"
            />
            <TestFeature
              icon={Brain}
              title="Covers interests, skills, and work styles"
            />
            <TestFeature
              icon={ChartBar}
              title="Personalized career recommendations"
            />
          </div>

          <button className="mt-12 bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700">
            Start Test →
          </button>
        </div>
      </div>
    </section>
  );
};

const TestFeature = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex items-center space-x-3 text-left">
    <Icon className="h-6 w-6 text-blue-600" />
    <span className="text-gray-700">{title}</span>
  </div>
);

export default AptitudeTest;