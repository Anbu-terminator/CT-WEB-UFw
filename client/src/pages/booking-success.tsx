import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import type { Booking } from "@shared/schema";

export default function BookingSuccess() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const bookingId = params.id;

  const { data: booking, isLoading } = useQuery<Booking>({
    queryKey: ["/api/bookings", bookingId],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) throw new Error('Failed to fetch booking');
      return response.json();
    },
    enabled: !!bookingId,
  });

  const downloadQRCode = () => {
    // TODO: Implement QR code generation and download
    console.log("Downloading QR code for booking:", bookingId);
  };

  const sendEmail = () => {
    // TODO: Implement email confirmation
    console.log("Sending email confirmation for booking:", bookingId);
  };

  if (isLoading) return <LoadingSpinner />;

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Booking not found</h1>
          <Button onClick={() => setLocation('/home')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <DarkModeToggle />
      
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <i className="fas fa-check text-3xl text-white"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Your reservation has been successfully processed.</p>
          
          <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Booking ID:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{booking.bookingId}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Guest Name:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{booking.guestName}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Check-in:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {new Date(booking.checkInDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Check-out:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {new Date(booking.checkOutDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Amount Paid:</span>
              <span className="font-semibold text-emerald-600">₹{booking.totalAmount}</span>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-white dark:bg-slate-600 p-4 rounded-xl mb-6 border-2 border-dashed border-gray-300 dark:border-slate-500">
            <div className="w-32 h-32 bg-gray-100 dark:bg-slate-500 rounded-lg mx-auto flex items-center justify-center">
              <i className="fas fa-qrcode text-4xl text-gray-400"></i>
            </div>
            <p className="text-xs text-gray-500 mt-2">Scan QR code for quick check-in</p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={downloadQRCode}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
            >
              <i className="fas fa-download mr-2"></i>Download QR Code
            </Button>
            <Button 
              onClick={sendEmail}
              variant="outline"
              className="w-full"
            >
              <i className="fas fa-envelope mr-2"></i>Email Confirmation
            </Button>
            <Button 
              onClick={() => setLocation('/home')}
              variant="outline"
              className="w-full"
            >
              <i className="fas fa-home mr-2"></i>Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
