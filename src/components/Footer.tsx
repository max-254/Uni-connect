import React from 'react';
import { Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Globe className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-2xl font-bold">UniMatch</span>
            </div>
            <p className="text-gray-300 mb-4">
              Helping students find their perfect university match abroad since 2025.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="/universities" className="text-gray-300 hover:text-white transition-colors">Find Universities</a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="/resources/visa-guide" className="text-gray-300 hover:text-white transition-colors">Visa Guide</a>
              </li>
              <li>
                <a href="/resources/scholarships" className="text-gray-300 hover:text-white transition-colors">Scholarships</a>
              </li>
              <li>
                <a href="/resources/application-tips" className="text-gray-300 hover:text-white transition-colors">Application Tips</a>
              </li>
              <li>
                <a href="/resources/country-guides" className="text-gray-300 hover:text-white transition-colors">Country Guides</a>
              </li>
              <li>
                <a href="/faqs" className="text-gray-300 hover:text-white transition-colors">FAQs</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
                <span className="text-gray-300">123 Education Street, Academic City, Country</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 flex-shrink-0 text-gray-400" />
                <a href="tel:+1234567890" className="text-gray-300 hover:text-white transition-colors">+1 (234) 567-890</a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 flex-shrink-0 text-gray-400" />
                <a href="mailto:info@unimatch.com" className="text-gray-300 hover:text-white transition-colors">info@unimatch.com</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} UniMatch. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;