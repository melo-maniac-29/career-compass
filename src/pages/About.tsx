import React from 'react';
import { Mail, Phone, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About Career Compass</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              At Career Compass, we believe that every individual deserves to find a fulfilling career path that aligns with their skills, interests, and ambitions. Our mission is to provide personalized guidance and comprehensive resources to help students and professionals navigate their career journeys with confidence.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600 mb-4">
              To become the most trusted career guidance platform that empowers individuals to make informed decisions about their professional futures, creating a world where everyone can pursue careers they are passionate about.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                <a href="mailto:info@careercompass.com" className="text-gray-600 hover:text-blue-600">
                  info@careercompass.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-gray-600">(555) 123-4567</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Connect With Us</h2>
            <p className="text-gray-600 mb-4">
              Follow us on social media for career tips, job postings, and success stories!
            </p>
            <div className="flex space-x-4">
              <SocialLink icon={Linkedin} href="#" />
              <SocialLink icon={Twitter} href="#" />
              <SocialLink icon={Facebook} href="#" />
              <SocialLink icon={Instagram} href="#" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const SocialLink = ({ icon: Icon, href }: { icon: any; href: string }) => (
  <a
    href={href}
    className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
  >
    <Icon className="h-6 w-6" />
  </a>
);

export default About;