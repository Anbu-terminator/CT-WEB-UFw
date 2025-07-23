import { Link } from "wouter";
import { DarkModeToggle } from "@/components/dark-mode-toggle";

export default function Home() {
  return (
    <section className="min-h-screen bg-gray-50 dark:bg-slate-900 px-6 py-8">
      <DarkModeToggle />
      
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full flex items-center justify-center mb-4 animate-float">
            <i className="fas fa-hotel text-2xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">BOOK NEO</h1>
          <p className="text-gray-600 dark:text-gray-300">Choose your access level</p>
        </div>

        {/* Menu Options */}
        <div className="space-y-6">
          {/* User Booking */}
          <Link href="/booking">
            <div className="menu-card group cursor-pointer transform hover:scale-105 transition-all duration-300">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-gray-200 dark:border-slate-700 neon-border">
                <img 
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                  alt="Luxury hotel room" 
                  className="w-full h-32 object-cover rounded-xl mb-4"
                />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Guest Booking</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Book your perfect stay</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center group-hover:animate-neon-pulse">
                    <i className="fas fa-calendar-check text-white"></i>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Hotel Login */}
          <Link href="/hotel-login">
            <div className="menu-card group cursor-pointer transform hover:scale-105 transition-all duration-300">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-gray-200 dark:border-slate-700">
                <img 
                  src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                  alt="Hotel reception" 
                  className="w-full h-32 object-cover rounded-xl mb-4"
                />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Hotel Staff</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your bookings</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center group-hover:animate-neon-pulse">
                    <i className="fas fa-users text-white"></i>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Admin Login */}
          <Link href="/admin-login">
            <div className="menu-card group cursor-pointer transform hover:scale-105 transition-all duration-300">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-gray-200 dark:border-slate-700">
                <img 
                  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                  alt="Hotel lobby management" 
                  className="w-full h-32 object-cover rounded-xl mb-4"
                />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Admin Panel</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">System administration</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center group-hover:animate-neon-pulse">
                    <i className="fas fa-shield-alt text-white"></i>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
