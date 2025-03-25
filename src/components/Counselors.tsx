import React from 'react';

const counselors = [
  {
    name: 'Dr. Sarah Thomas',
    field: 'Engineering & Technology',
    specialization: 'Computer Science',
    experience: '15+ years',
    languages: ['English', 'Mandarin', 'Hindi'],
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80'
  },
  {
    name: 'Dr. Anurag Agarwal',
    field: 'Medical Science',
    specialization: 'Healthcare and Pharmaceutical Sciences',
    experience: '12+ years',
    languages: ['English', 'Hindi'],
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    name: 'Prof. Abraham Vincent',
    field: 'Commerce & Management',
    specialization: 'Finance and Business Strategy',
    experience: '18+ years',
    languages: ['English', 'Malayalam'],
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  }
];

const Counselors = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Counselors</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {counselors.map((counselor) => (
            <div key={counselor.name} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <img
                    src={counselor.image}
                    alt={counselor.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-center text-gray-900">{counselor.name}</h3>
                <p className="text-blue-600 text-center mb-4">{counselor.field}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Experience:</strong> {counselor.experience}</p>
                  <p><strong>Specialization:</strong> {counselor.specialization}</p>
                  <p><strong>Languages:</strong> {counselor.languages.join(', ')}</p>
                </div>
                <div className="mt-6 flex space-x-4">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Book Session
                  </button>
                  <button className="flex-1 border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50">
                    Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Counselors;