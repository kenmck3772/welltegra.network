import React from 'react';

export default function Footer() {
  return (
    <footer className="relative py-12 px-6 lg:px-8 border-t border-white/10">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-950" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              WellTegra
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sovereign Industrial Platform for Physics-Driven Wellbore Verification
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Mission Control</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Brahan Engine</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Compliance Suite</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Resources
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Technical Whitepaper</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">NSTA Compliance Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">EU AI Act Brief</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Company
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our Pedigree</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500">
            © 2026 WellTegra. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-teal-500/20 rounded-full text-xs text-slate-400">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            <span>System Status: Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
