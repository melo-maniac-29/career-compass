import React from 'react';
import { Code2, Stethoscope, BarChart3 } from 'lucide-react';

const CareerCards = () => {
  const careers = [
    {
      title: 'Engineering',
      icon: Code2,
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      description: 'Explore various engineering fields including software, mechanical, and electrical engineering.'
    },
    {
      title: 'Medical Sciences',
      icon: Stethoscope,
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      description: 'Career opportunities in healthcare, medicine, and nursing fields.'
    },
    {
      title: 'Commerce & Management',
      icon: BarChart3,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      description: 'Business, finance, and management career paths.'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {careers.map((career) => (
            <div key={career.title} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 w-full relative">
                <img
                  src={career.image}
                  alt={career.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center">
                  <career.icon className="h-6 w-6 text-blue-600" />
                  <h3 className="ml-2 text-xl font-semibold text-gray-900">{career.title}</h3>
                </div>
                <p className="mt-4 text-gray-600">{career.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CareerCards;