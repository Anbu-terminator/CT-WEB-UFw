import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/dark-mode-toggle";

export default function BookingFailure() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <DarkModeToggle />
      
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-times text-3xl text-white"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment Failed</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We couldn't process your payment. Please try again or contact support if the issue persists.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => setLocation('/booking')}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
            >
              <i className="fas fa-retry mr-2"></i>Try Again
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
