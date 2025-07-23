import { hotels, hotelUsers, bookings, admins, type Hotel, type InsertHotel, type HotelUser, type InsertHotelUser, type Booking, type InsertBooking, type Admin, type InsertAdmin } from "@shared/schema";

export interface IStorage {
  // Hotels
  getHotels(): Promise<Hotel[]>;
  getHotel(id: number): Promise<Hotel | undefined>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  updateHotel(id: number, hotel: Partial<InsertHotel>): Promise<Hotel | undefined>;
  deleteHotel(id: number): Promise<boolean>;

  // Hotel Users
  getHotelUser(username: string): Promise<HotelUser | undefined>;
  createHotelUser(user: InsertHotelUser): Promise<HotelUser>;
  getHotelUsersByHotel(hotelId: number): Promise<HotelUser[]>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getBookingsByHotel(hotelId: number): Promise<Booking[]>;
  getBooking(bookingId: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;

  // Admins
  getAdmin(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class MemStorage implements IStorage {
  private hotels: Map<number, Hotel>;
  private hotelUsers: Map<string, HotelUser>;
  private bookings: Map<string, Booking>;
  private admins: Map<string, Admin>;
  private currentHotelId: number;
  private currentUserId: number;
  private currentBookingId: number;
  private currentAdminId: number;

  constructor() {
    this.hotels = new Map();
    this.hotelUsers = new Map();
    this.bookings = new Map();
    this.admins = new Map();
    this.currentHotelId = 1;
    this.currentUserId = 1;
    this.currentBookingId = 1;
    this.currentAdminId = 1;

    // Initialize with default admin
    this.admins.set("bastoffcial@gmail.com", {
      id: this.currentAdminId++,
      email: "bastoffcial@gmail.com",
      password: "BookNeo@202512005",
      createdAt: new Date(),
    });

    // Initialize with sample hotels
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample hotels
    const grandPalace: Hotel = {
      id: this.currentHotelId++,
      name: "Grand Palace Hotel",
      location: "Downtown Mumbai",
      photo: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      baseRate: 4500,
      amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
      status: "active",
      createdAt: new Date(),
    };

    const oceanView: Hotel = {
      id: this.currentHotelId++,
      name: "Ocean View Resort",
      location: "Goa Beachfront",
      photo: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      baseRate: 3200,
      amenities: ["Beach Access", "Pool", "Restaurant", "Spa"],
      status: "active",
      createdAt: new Date(),
    };

    this.hotels.set(grandPalace.id, grandPalace);
    this.hotels.set(oceanView.id, oceanView);

    // Create sample hotel users
    this.hotelUsers.set("grandpalace_staff", {
      id: this.currentUserId++,
      hotelId: grandPalace.id,
      username: "grandpalace_staff",
      password: "staff123",
      role: "staff",
      createdAt: new Date(),
    });

    this.hotelUsers.set("oceanview_staff", {
      id: this.currentUserId++,
      hotelId: oceanView.id,
      username: "oceanview_staff",
      password: "staff123",
      role: "staff",
      createdAt: new Date(),
    });
  }

  private generateBookingId(): string {
    const year = new Date().getFullYear();
    const id = this.currentBookingId.toString().padStart(3, '0');
    return `BN-${year}-${id}`;
  }

  // Hotels
  async getHotels(): Promise<Hotel[]> {
    return Array.from(this.hotels.values());
  }

  async getHotel(id: number): Promise<Hotel | undefined> {
    return this.hotels.get(id);
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    const id = this.currentHotelId++;
    const newHotel: Hotel = {
      ...hotel,
      id,
      status: hotel.status || "active",
      photo: hotel.photo || null,
      amenities: hotel.amenities || [],
      createdAt: new Date(),
    };
    this.hotels.set(id, newHotel);
    return newHotel;
  }

  async updateHotel(id: number, hotel: Partial<InsertHotel>): Promise<Hotel | undefined> {
    const existing = this.hotels.get(id);
    if (!existing) return undefined;

    const updated: Hotel = { ...existing, ...hotel };
    this.hotels.set(id, updated);
    return updated;
  }

  async deleteHotel(id: number): Promise<boolean> {
    return this.hotels.delete(id);
  }

  // Hotel Users
  async getHotelUser(username: string): Promise<HotelUser | undefined> {
    return this.hotelUsers.get(username);
  }

  async createHotelUser(user: InsertHotelUser): Promise<HotelUser> {
    const id = this.currentUserId++;
    const newUser: HotelUser = {
      ...user,
      id,
      role: user.role || "staff",
      createdAt: new Date(),
    };
    this.hotelUsers.set(user.username, newUser);
    return newUser;
  }

  async getHotelUsersByHotel(hotelId: number): Promise<HotelUser[]> {
    return Array.from(this.hotelUsers.values()).filter(user => user.hotelId === hotelId);
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBookingsByHotel(hotelId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.hotelId === hotelId);
  }

  async getBooking(bookingId: string): Promise<Booking | undefined> {
    return this.bookings.get(bookingId);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const bookingId = this.generateBookingId();
    const newBooking: Booking = {
      ...booking,
      id,
      bookingId,
      status: booking.status || "confirmed",
      paymentStatus: booking.paymentStatus || "pending",
      transactionId: booking.transactionId || null,
      cashfreeOrderId: booking.cashfreeOrderId || null,
      specialRequests: booking.specialRequests || null,
      createdAt: new Date(),
    };
    this.bookings.set(bookingId, newBooking);
    this.currentBookingId++;
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const existing = Array.from(this.bookings.values()).find(b => b.id === id);
    if (!existing) return undefined;

    const updated: Booking = { ...existing, ...booking };
    this.bookings.set(existing.bookingId, updated);
    return updated;
  }

  // Admins
  async getAdmin(email: string): Promise<Admin | undefined> {
    return this.admins.get(email);
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const id = this.currentAdminId++;
    const newAdmin: Admin = {
      ...admin,
      id,
      createdAt: new Date(),
    };
    this.admins.set(admin.email, newAdmin);
    return newAdmin;
  }
}

import { MongoDBStorage } from "./storage-mongodb";

// Use MongoDB storage instead of memory storage
export const storage = new MongoDBStorage();
