import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { initiateRazorpayPayment, generateOrderId, loadRazorpaySDK } from "@/lib/razorpay";
import type { Hotel } from "@shared/schema";

interface BookingForm {
  hotelId: number;
  roomType: string;
  guestName: string;
  guestContact: string;
  checkInDate: string;
  checkOutDate: string;
  specialRequests: string;
}

export default function Booking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [formData, setFormData] = useState<BookingForm>({
    hotelId: 0,
    roomType: "",
    guestName: "",
    guestContact: "",
    checkInDate: "",
    checkOutDate: "",
    specialRequests: "",
  });

  const { data: hotels, isLoading } = useQuery<Hotel[]>({
    queryKey: ["/api/hotels"],
  });

  // Load Razorpay SDK on component mount
  useEffect(() => {
    loadRazorpaySDK().catch(console.error);
  }, []);

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) throw new Error("Failed to create booking");
      return response.json();
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setLocation(`/booking-success/${booking.bookingId}`);
    },
    onError: () => {
      setLocation("/booking-failure");
    },
  });

  const getRoomTypePrice = (baseRate: number, roomType: string): number => {
    let price = baseRate;
    switch (roomType) {
      case "suite":
        price += 1000;
        break;
      case "ac":
        price += 500;
        break;
      default:
        break;
    }
    return price;
  };

  const calculateTotal = (): number => {
    if (!selectedHotel || !formData.checkInDate || !formData.checkOutDate) return 0;
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) return 0;
    
    const roomPrice = getRoomTypePrice(selectedHotel.baseRate, selectedRoomType);
    return roomPrice * nights;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedHotel || !selectedRoomType) {
      toast({
        title: "Error",
        description: "Please select a hotel and room type",
        variant: "destructive",
      });
      return;
    }

    const total = calculateTotal();
    if (total <= 0) {
      toast({
        title: "Error",
        description: "Invalid dates selected",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderId = generateOrderId();
      
      // First create the booking
      const bookingData = {
        ...formData,
        hotelId: selectedHotel.id,
        roomType: selectedRoomType,
        totalAmount: total,
        razorpayOrderId: orderId,
      };

      const booking = await createBookingMutation.mutateAsync(bookingData);

      // Then initiate payment with the booking ID for redirect
      const paymentResult = await initiateRazorpayPayment({
        orderId,
        amount: total,
        customerName: formData.guestName,
        customerPhone: formData.guestContact,
        bookingId: booking.bookingId,
        customerEmail: `${formData.guestContact.replace(/\D/g, '')}@bookneoapp.com`,
      });

      if (paymentResult.success) {
        // Redirect to success page with booking ID
        setLocation(`/booking-success/${booking.bookingId}`);
      }

    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: "Failed to initiate payment",
        variant: "destructive",
      });
      // Redirect to failure page
      setLocation("/booking-failure");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-slate-900 px-6 py-8">
      <DarkModeToggle />
      
      <div className="max-w-md mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8 pt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/home')}
            className="mr-4"
          >
            <i className="fas fa-arrow-left"></i>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book Your Stay</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Find the perfect room</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hotel Selection */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <Label className="block text-sm font-medium mb-3">Select Hotel</Label>
            <div className="space-y-3">
              {hotels?.map((hotel) => (
                <div
                  key={hotel.id}
                  onClick={() => {
                    setSelectedHotel(hotel);
                    setFormData({ ...formData, hotelId: hotel.id });
                  }}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    selectedHotel?.id === hotel.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-slate-600 hover:border-indigo-300'
                  }`}
                >
                  <img 
                    src={hotel.photo || "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"} 
                    alt={hotel.name}
                    className="w-full h-24 object-cover rounded-lg mb-3"
                  />
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{hotel.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{hotel.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">₹{hotel.baseRate}</p>
                      <p className="text-xs text-gray-500">per night</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Room Type Selection */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <Label className="block text-sm font-medium mb-3">Room Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'suite', label: 'Suite', icon: 'crown', price: '+₹1000' },
                { id: 'deluxe', label: 'Deluxe', icon: 'bed', price: 'Standard' },
                { id: 'ac', label: 'AC', icon: 'snowflake', price: '+₹500' },
                { id: 'non-ac', label: 'Non-AC', icon: 'fan', price: 'Basic' },
              ].map((room) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoomType(room.id)}
                  className={`p-3 border-2 rounded-xl text-center cursor-pointer transition-colors ${
                    selectedRoomType === room.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-slate-600 hover:border-indigo-300'
                  }`}
                >
                  <i className={`fas fa-${room.icon} ${selectedRoomType === room.id ? 'text-indigo-500' : 'text-gray-400'} mb-2`}></i>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{room.label}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{room.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Guest Details */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Guest Details</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="guestName">Full Name</Label>
                <Input
                  id="guestName"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="guestContact">Contact Number</Label>
                <Input
                  id="guestContact"
                  value={formData.guestContact}
                  onChange={(e) => setFormData({ ...formData, guestContact: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="checkIn">Check-in</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Check-out</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <Textarea
                  id="requests"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  placeholder="Any special requirements..."
                  className="h-20 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          {selectedHotel && selectedRoomType && formData.checkInDate && formData.checkOutDate && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{selectedHotel.name} ({selectedRoomType})</span>
                  <span>₹{getRoomTypePrice(selectedHotel.baseRate, selectedRoomType)}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} nights
                  </span>
                  <span>×{Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))}</span>
                </div>
                <div className="border-t border-white/20 pt-2 mt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <Button
            type="submit"
            disabled={createBookingMutation.isPending || !selectedHotel || !selectedRoomType}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-neon-pulse"
          >
            {createBookingMutation.isPending ? (
              <LoadingSpinner />
            ) : (
              <>
                <i className="fas fa-credit-card mr-2"></i>
                Pay ₹{calculateTotal()} via Razorpay
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
