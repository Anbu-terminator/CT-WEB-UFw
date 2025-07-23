import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Splash from "@/pages/splash";
import Home from "@/pages/home";
import Booking from "@/pages/booking";
import BookingSuccess from "@/pages/booking-success";
import BookingFailure from "@/pages/booking-failure";
import HotelLogin from "@/pages/hotel-login";
import HotelDashboard from "@/pages/hotel-dashboard";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import { ThemeProvider } from "@/components/theme-provider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/home" component={Home} />
      <Route path="/booking" component={Booking} />
      <Route path="/booking-success/:id" component={BookingSuccess} />
      <Route path="/booking-failure" component={BookingFailure} />
      <Route path="/hotel-login" component={HotelLogin} />
      <Route path="/hotel-dashboard" component={HotelDashboard} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
