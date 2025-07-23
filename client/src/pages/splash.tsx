import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Splash() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Animate loading bar
    const loadingBar = document.querySelector('.loading-bar') as HTMLElement;
    if (loadingBar) {
      loadingBar.style.width = '0%';
      setTimeout(() => {
        loadingBar.style.transition = 'width 3s ease-out';
        loadingBar.style.width = '100%';
      }, 100);
    }

    // Countdown timer
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => setLocation('/home'), 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setLocation]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      
      {/* Animated background particles */}
      <div className="absolute inset-0">
        <div className="particle absolute w-2 h-2 bg-white rounded-full opacity-50 animate-float" 
             style={{top: '20%', left: '10%', animationDelay: '0s'}}></div>
        <div className="particle absolute w-1 h-1 bg-blue-400 rounded-full opacity-70 animate-float" 
             style={{top: '40%', left: '80%', animationDelay: '1s'}}></div>
        <div className="particle absolute w-3 h-3 bg-pink-400 rounded-full opacity-40 animate-float" 
             style={{top: '70%', left: '30%', animationDelay: '2s'}}></div>
      </div>
      
      <div className="text-center z-10 px-6">
        <div className="mb-8 animate-float">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl animate-neon-pulse">
            <i className="fas fa-hotel text-4xl text-indigo-600"></i>
          </div>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 animate-glow neon-text">BOOK NEO</h1>
        <p className="text-xl text-white opacity-90 mb-8">Premium Hotel Booking Experience</p>
        <div className="flex justify-center">
          <div className="w-16 h-1 bg-white rounded-full opacity-50 relative">
            <div className="loading-bar absolute h-full bg-blue-400 rounded-full transition-all duration-300" 
                 style={{width: '0%'}}></div>
          </div>
        </div>
        <p className="text-white opacity-70 mt-4 text-sm">
          Redirecting in <span id="countdown">{countdown}</span> seconds...
        </p>
      </div>
    </section>
  );
}
