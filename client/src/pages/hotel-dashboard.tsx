import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { authManager } from "@/lib/auth";
import type { Booking } from "@shared/schema";

export default function HotelDashboard() {
  const [, setLocation] = useLocation();
  const [authState, setAuthState] = useState(authManager.getState());
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authState.isAuthenticated || authState.role !== "hotel") {
      setLocation('/hotel-login');
    }
  }, [authState, setLocation]);

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings", authState.hotel?.id],
    queryFn: async () => {
      const response = await fetch(`/api/bookings?hotelId=${authState.hotel?.id}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
    enabled: !!authState.hotel?.id,
  });

  const filteredBookings = bookings?.filter(booking => {
    if (!dateFilter) return true;
    const checkInDate = new Date(booking.checkInDate).toISOString().split('T')[0];
    return checkInDate === dateFilter;
  }) || [];

  const stats = {
    todayBookings: filteredBookings.filter(b => {
      const today = new Date().toISOString().split('T')[0];
      const checkIn = new Date(b.checkInDate).toISOString().split('T')[0];
      return checkIn === today;
    }).length,
    totalRevenue: filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0),
    pendingBookings: filteredBookings.filter(b => b.paymentStatus === 'pending').length,
  };

  const handleLogout = () => {
    authManager.logout();
    setLocation('/home');
  };

  if (!authState.isAuthenticated || !authState.hotel) {
    return <LoadingSpinner />;
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-slate-900 px-6 py-8">
      <DarkModeToggle />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hotel Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">{authState.hotel.name}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <i className="fas fa-download"></i>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Today's Bookings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayBookings}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                <i className="fas fa-calendar-check text-emerald-500"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <i className="fas fa-rupee-sign text-blue-500"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingBookings}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <i className="fas fa-clock text-orange-500"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Bookings</h3>
              <div className="flex items-center space-x-2">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="text-sm"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDateFilter("")}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {filteredBookings.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {booking.guestName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{booking.guestName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{booking.guestContact}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.bookingId}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{booking.totalAmount}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        booking.paymentStatus === 'completed' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {booking.paymentStatus === 'completed' ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <i className="fas fa-eye"></i>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <i className="fas fa-qrcode"></i>
                      </Button>
                    </div>
                  </div>
                  {booking.specialRequests && (
                    <div className="mt-3 px-4 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
