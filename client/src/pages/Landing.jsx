import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Droplet, Users, Clock, Shield, MapPin, ArrowRight, CheckCircle, Activity } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50">
      {/* Fixed Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <Heart className="w-10 h-10 text-red-600 fill-red-600 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold">
                <span className="text-gray-800">Blood</span>
                <span className="text-red-600">Connect</span>
              </span>
            </Link>
            
            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <Link 
                to="/login"
                className="px-6 py-2.5 text-gray-700 hover:text-red-600 font-medium transition-colors rounded-lg hover:bg-red-50"
              >
                Login
              </Link>
              <Link 
                to="/register"
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 px-6 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
        <div className="absolute top-40 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold">
                <Droplet className="w-4 h-4" />
                <span>Saving Lives Together</span>
              </div>
              
              {/* Main Heading */}
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Find Blood Donors
                </h1>
                <h1 className="text-5xl lg:text-6xl font-bold text-red-600 leading-tight mt-2">
                  Instantly
                </h1>
              </div>
              
              {/* Description */}
              <p className="text-xl text-gray-600 leading-relaxed">
                Connect with blood donors in your area during emergencies. 
                Save lives by donating or finding donors within minutes.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-700 transition-all shadow-xl hover:shadow-2xl font-semibold text-lg"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button 
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-all font-semibold text-lg"
                >
                  Learn More
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">1000+</div>
                  <div className="text-sm text-gray-600 mt-1">Active Donors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">500+</div>
                  <div className="text-sm text-gray-600 mt-1">Lives Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">50+</div>
                  <div className="text-sm text-gray-600 mt-1">Hospitals</div>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="space-y-4">
              {/* Card 1 - Available Donor */}
              <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition-shadow border border-gray-100">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Droplet className="w-8 h-8 text-red-600 fill-red-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="font-bold text-gray-900 text-lg">Available Donor</div>
                  <div className="text-sm text-gray-600">2.5 km away • A+ Blood Type</div>
                </div>
                <div className="flex-shrink-0">
                  <CheckCircle className="w-7 h-7 text-green-500" />
                </div>
              </div>

              {/* Card 2 - Quick Response */}
              <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition-shadow border border-gray-100">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="font-bold text-gray-900 text-lg">Quick Response</div>
                  <div className="text-sm text-gray-600">Average 5 min response time</div>
                </div>
                <div className="flex-shrink-0">
                  <Activity className="w-7 h-7 text-blue-500" />
                </div>
              </div>

              {/* Card 3 - Verified Donors */}
              <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition-shadow border border-gray-100">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="font-bold text-gray-900 text-lg">Verified Donors</div>
                  <div className="text-sm text-gray-600">100% authenticated users</div>
                </div>
                <div className="flex-shrink-0">
                  <CheckCircle className="w-7 h-7 text-green-500" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose BloodConnect?
            </h2>
            <p className="text-xl text-gray-600">
              The fastest way to connect donors and save lives
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-red-50 to-white border border-red-100 hover:shadow-2xl hover:border-red-200 transition-all duration-300">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Location Based Search
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Find blood donors near you instantly. Our smart location system connects you with the nearest available donors.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Real-Time Availability
              </h3>
              <p className="text-gray-600 leading-relaxed">
                See who's available to donate right now. Get instant responses and save precious time during emergencies.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-green-50 to-white border border-green-100 hover:shadow-2xl hover:border-green-200 transition-all duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Verified Community
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Join a trusted network of donors and hospitals. Every member is verified for your safety and peace of mind.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to save a life
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-12">
            
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="inline-flex w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-xl">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Sign Up Free
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Create your account as a donor, patient, or hospital. It takes less than 2 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="inline-flex w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-xl">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Search or Request
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Search for donors by blood type and location, or create an urgent request.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="inline-flex w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-xl">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Connect & Save
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get in touch with donors directly and save lives. It's that simple!
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 via-red-600 to-red-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <Heart className="w-20 h-20 text-white mx-auto mb-8 fill-white" />
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of donors and save lives in your community today.
          </p>
          <Link 
            to="/register"
            className="inline-flex items-center gap-3 bg-white text-red-600 px-10 py-5 rounded-2xl hover:bg-gray-100 transition-all shadow-2xl font-bold text-xl"
          >
            <span>Join Now - It's Free</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Footer Grid */}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            
            {/* Column 1 - Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                <span className="text-xl font-bold">BloodConnect</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting lives, one donation at a time.
              </p>
            </div>
            
            {/* Column 2 - Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              </ul>
            </div>
            
            {/* Column 3 - Support */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            {/* Column 4 - Connect */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Connect</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              </ul>
            </div>
            
          </div>
          
          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 BloodConnect. All rights reserved. Every drop counts! 🩸</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;