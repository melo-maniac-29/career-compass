import React from 'react';

const Hero = () => {
  return (
    <div className="relative bg-blue-900 text-white">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Career Compass
        </h1>
        <p className="mt-6 max-w-3xl text-xl">
          Discover Your Perfect Career Path
        </p>
      </div>
    </div>
  );
};

export default Hero;