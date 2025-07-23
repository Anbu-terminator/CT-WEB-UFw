import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { useToast } from "@/hooks/use-toast";
import { authManager } from "@/lib/auth";
import type { Hotel, Booking } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState(authManager.getState());
  
  const [newHotel, setNewHotel] = useState({
    name: "",
    location: "",
    photo: "",
    baseRate: "",
    amenities: "",
    staffUsername: "",
    staffPassword: "",
  });

  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [editHotelData, setEditHotelData] = useState({
    name: "",
    location: "",
    photo: "",
    baseRate: "",
    amenities: "",
    status: "active",
  });

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authState.isAuthenticated || authState.role !== "admin") {
      setLocation('/admin-login');
    }
  }, [authState, setLocation]);

  const { data: hotels, isLoading: hotelsLoading } = useQuery<Hotel[]>({
    queryKey: ["/api/hotels"],
  });

  const { data: allBookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const createHotelMutation = useMutation({
    mutationFn: async (hotelData: any) => {
      const response = await fetch("/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hotelData),
      });
      if (!response.ok) throw new Error("Failed to create hotel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels"] });
      toast({
        title: "Success",
        description: "Hotel created successfully",
      });
      setNewHotel({
        name: "",
        location: "",
        photo: "",
        baseRate: "",
        amenities: "",
        staffUsername: "",
        staffPassword: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create hotel",
        variant: "destructive",
      });
    },
  });

  const updateHotelMutation = useMutation({
    mutationFn: async ({ id, hotelData }: { id: number; hotelData: any }) => {
      const response = await fetch(`/api/hotels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hotelData),
      });
      if (!response.ok) throw new Error("Failed to update hotel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels"] });
      toast({
        title: "Success",
        description: "Hotel updated successfully",
      });
      setEditingHotel(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update hotel",
        variant: "destructive",
      });
    },
  });

  const createHotelUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch("/api/hotel-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Failed to create hotel user");
      return response.json();
    },
  });

  const deleteHotelMutation = useMutation({
    mutationFn: async (hotelId: number) => {
      const response = await fetch(`/api/hotels/${hotelId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete hotel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels"] });
      toast({
        title: "Success",
        description: "Hotel deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete hotel",
        variant: "destructive",
      });
    },
  });

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newHotel.name || !newHotel.location || !newHotel.baseRate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create hotel
      const hotel = await createHotelMutation.mutateAsync({
        name: newHotel.name,
        location: newHotel.location,
        photo: newHotel.photo,
        baseRate: parseInt(newHotel.baseRate),
        amenities: newHotel.amenities ? newHotel.amenities.split(',').map(a => a.trim()) : [],
        status: "active",
      });

      // Create hotel user if credentials provided
      if (newHotel.staffUsername && newHotel.staffPassword) {
        await createHotelUserMutation.mutateAsync({
          hotelId: hotel.id,
          username: newHotel.staffUsername,
          password: newHotel.staffPassword,
          role: "staff",
        });
      }
    } catch (error) {
      console.error("Error creating hotel:", error);
    }
  };

  const handleEditHotel = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setEditHotelData({
      name: hotel.name,
      location: hotel.location,
      photo: hotel.photo || "",
      baseRate: hotel.baseRate.toString(),
      amenities: hotel.amenities ? hotel.amenities.join(', ') : "",
      status: hotel.status,
    });
  };

  const handleUpdateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingHotel || !editHotelData.name || !editHotelData.location || !editHotelData.baseRate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateHotelMutation.mutateAsync({
        id: editingHotel.id,
        hotelData: {
          name: editHotelData.name,
          location: editHotelData.location,
          photo: editHotelData.photo,
          baseRate: parseInt(editHotelData.baseRate),
          amenities: editHotelData.amenities ? editHotelData.amenities.split(',').map(a => a.trim()) : [],
          status: editHotelData.status,
        },
      });
    } catch (error) {
      console.error("Error updating hotel:", error);
    }
  };

  const handleLogout = () => {
    authManager.logout();
    setLocation('/home');
  };

  const stats = {
    totalHotels: hotels?.length || 0,
    totalBookings: allBookings?.length || 0,
    totalRevenue: allBookings?.reduce((sum, b) => sum + b.totalAmount, 0) || 0,
    activeUsers: hotels?.length || 0, // Simplified calculation
  };

  if (!authState.isAuthenticated) {
    return <LoadingSpinner />;
  }

  if (hotelsLoading || bookingsLoading) return <LoadingSpinner />;

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-slate-900 px-6 py-8">
      <DarkModeToggle />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">System Management</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>Logout
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Hotels</p>
                <p className="text-3xl font-bold">{stats.totalHotels}</p>
              </div>
              <i className="fas fa-building text-3xl text-blue-200"></i>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100">Total Bookings</p>
                <p className="text-3xl font-bold">{stats.totalBookings}</p>
              </div>
              <i className="fas fa-calendar-check text-3xl text-emerald-200"></i>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Revenue</p>
                <p className="text-3xl font-bold">₹{Math.round(stats.totalRevenue / 100000)}L</p>
              </div>
              <i className="fas fa-chart-line text-3xl text-purple-200"></i>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Active Users</p>
                <p className="text-3xl font-bold">{stats.activeUsers}</p>
              </div>
              <i className="fas fa-users text-3xl text-orange-200"></i>
            </div>
          </div>
        </div>

        {/* Hotel Management */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Hotel List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hotel Management</h3>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {hotels?.map((hotel) => (
                <div key={hotel.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={hotel.photo || "https://images.unsplash.com/photo-1582719508461-905c673771fd"} 
                      alt={hotel.name}
                      className="w-16 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{hotel.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{hotel.location}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded-full">
                          {hotel.status}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">₹{hotel.baseRate}/night</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditHotel(hotel)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteHotelMutation.mutate(hotel.id)}
                      disabled={deleteHotelMutation.isPending}
                    >
                      <i className="fas fa-trash text-red-500"></i>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add/Edit Hotel Form */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
              </h3>
              {editingHotel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingHotel(null)}
                  className="mt-2"
                >
                  <i className="fas fa-times mr-2"></i>
                  Cancel Edit
                </Button>
              )}
            </div>
            <div className="p-6">
              <form onSubmit={editingHotel ? handleUpdateHotel : handleCreateHotel} className="space-y-4">
                <div>
                  <Label htmlFor="hotelName">Hotel Name</Label>
                  <Input
                    id="hotelName"
                    value={editingHotel ? editHotelData.name : newHotel.name}
                    onChange={(e) => editingHotel 
                      ? setEditHotelData({ ...editHotelData, name: e.target.value })
                      : setNewHotel({ ...newHotel, name: e.target.value })
                    }
                    placeholder="Enter hotel name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editingHotel ? editHotelData.location : newHotel.location}
                    onChange={(e) => editingHotel 
                      ? setEditHotelData({ ...editHotelData, location: e.target.value })
                      : setNewHotel({ ...newHotel, location: e.target.value })
                    }
                    placeholder="Enter location"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="photo">Hotel Photo URL</Label>
                  <Input
                    id="photo"
                    value={editingHotel ? editHotelData.photo : newHotel.photo}
                    onChange={(e) => editingHotel 
                      ? setEditHotelData({ ...editHotelData, photo: e.target.value })
                      : setNewHotel({ ...newHotel, photo: e.target.value })
                    }
                    placeholder="Enter photo URL"
                  />
                </div>
                <div>
                  <Label htmlFor="baseRate">Base Rate (₹ per night)</Label>
                  <Input
                    id="baseRate"
                    type="number"
                    value={editingHotel ? editHotelData.baseRate : newHotel.baseRate}
                    onChange={(e) => editingHotel 
                      ? setEditHotelData({ ...editHotelData, baseRate: e.target.value })
                      : setNewHotel({ ...newHotel, baseRate: e.target.value })
                    }
                    placeholder="3000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amenities">Hotel Amenities</Label>
                  <Input
                    id="amenities"
                    value={editingHotel ? editHotelData.amenities : newHotel.amenities}
                    onChange={(e) => editingHotel 
                      ? setEditHotelData({ ...editHotelData, amenities: e.target.value })
                      : setNewHotel({ ...newHotel, amenities: e.target.value })
                    }
                    placeholder="WiFi, Pool, Gym, Spa, Restaurant (comma-separated)"
                  />
                </div>
                {!editingHotel && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="staffUsername">Staff Username</Label>
                      <Input
                        id="staffUsername"
                        value={newHotel.staffUsername}
                        onChange={(e) => setNewHotel({ ...newHotel, staffUsername: e.target.value })}
                        placeholder="staff_username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="staffPassword">Staff Password</Label>
                      <Input
                        id="staffPassword"
                        type="password"
                        value={newHotel.staffPassword}
                        onChange={(e) => setNewHotel({ ...newHotel, staffPassword: e.target.value })}
                        placeholder="Generate secure password"
                      />
                    </div>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={createHotelMutation.isPending || updateHotelMutation.isPending}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold"
                >
                  {(createHotelMutation.isPending || updateHotelMutation.isPending) ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <i className={`fas fa-${editingHotel ? 'save' : 'plus'} mr-2`}></i>
                      {editingHotel ? 'Update Hotel' : 'Create Hotel'}
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Recent System Activity */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent System Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {allBookings?.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center space-x-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-white text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">New booking confirmed</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {booking.bookingId} • {booking.guestName} • ₹{booking.totalAmount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
