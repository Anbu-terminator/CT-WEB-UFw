import { MongoClient, ObjectId, Db, Collection } from "mongodb";
import type { Hotel, HotelUser, Booking, Admin, InsertHotel, InsertHotelUser, InsertBooking, InsertAdmin } from "@shared/schema";
import type { IStorage } from "./storage";

export class MongoDBStorage implements IStorage {
  private client: MongoClient;
  private db: Db;
  private hotels: Collection<Hotel>;
  private hotelUsers: Collection<HotelUser>;
  private bookings: Collection<Booking>;
  private admins: Collection<Admin>;
  private isConnected = false;

  constructor() {
    const connectionString = "mongodb+srv://bastoffcial:aI4fEcricKXwBZ4f@speedo.swuhr8z.mongodb.net/";
    this.client = new MongoClient(connectionString);
    this.db = this.client.db("bookneoapp");
    this.hotels = this.db.collection<Hotel>("hotels");
    this.hotelUsers = this.db.collection<HotelUser>("hotel_users");
    this.bookings = this.db.collection<Booking>("bookings");
    this.admins = this.db.collection<Admin>("admins");
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
      console.log("Connected to MongoDB");
      
      // Initialize with sample data if collections are empty
      await this.initializeSampleData();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log("Disconnected from MongoDB");
    }
  }

  private async initializeSampleData(): Promise<void> {
    try {
      // Check if hotels collection is empty
      const hotelCount = await this.hotels.countDocuments();
      if (hotelCount === 0) {
        console.log("Initializing sample data...");

        // Insert sample hotels
        const sampleHotels = [
          {
            id: 1,
            name: "Grand Palace Hotel",
            location: "Mumbai, Maharashtra",
            photo: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
            baseRate: 3500,
            amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
            status: "active",
            createdAt: new Date(),
          },
          {
            id: 2,
            name: "Ocean View Resort",
            location: "Goa, India", 
            photo: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9",
            baseRate: 2800,
            amenities: ["WiFi", "Pool", "Beach Access", "Restaurant", "Bar"],
            status: "active",
            createdAt: new Date(),
          }
        ];

        await this.hotels.insertMany(sampleHotels);

        // Insert sample hotel users
        const sampleUsers = [
          {
            id: 1,
            hotelId: 1,
            username: "grand_staff",
            password: "password123",
            role: "staff",
            createdAt: new Date(),
          },
          {
            id: 2,
            hotelId: 2,
            username: "ocean_staff",
            password: "password123", 
            role: "staff",
            createdAt: new Date(),
          }
        ];

        await this.hotelUsers.insertMany(sampleUsers);

        // Insert sample admin
        await this.admins.insertOne({
          id: 1,
          email: "admin@bookneoapp.com",
          password: "admin123",
          createdAt: new Date(),
        });

        console.log("Sample data initialized successfully");
      }
    } catch (error) {
      console.error("Error initializing sample data:", error);
    }
  }

  private async getNextId(collection: Collection): Promise<number> {
    const lastDoc = await collection.findOne({}, { sort: { id: -1 } });
    return lastDoc ? (lastDoc as any).id + 1 : 1;
  }

  private generateBookingId(): string {
    const year = new Date().getFullYear();
    const random = Math.random().toString().substr(2, 5);
    return `BN-${year}-${random}`;
  }

  // Hotels
  async getHotels(): Promise<Hotel[]> {
    await this.connect();
    return await this.hotels.find({}).toArray();
  }

  async getHotel(id: number): Promise<Hotel | undefined> {
    await this.connect();
    const hotel = await this.hotels.findOne({ id });
    return hotel || undefined;
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    await this.connect();
    const id = await this.getNextId(this.hotels);
    const newHotel: Hotel = {
      ...hotel,
      id,
      amenities: typeof hotel.amenities === 'string' 
        ? hotel.amenities.split(',').map(a => a.trim()).filter(Boolean) 
        : Array.isArray(hotel.amenities) ? hotel.amenities : [],
      status: "active",
      createdAt: new Date(),
    };
    
    await this.hotels.insertOne(newHotel);
    return newHotel;
  }

  async updateHotel(id: number, hotel: Partial<InsertHotel>): Promise<Hotel | undefined> {
    await this.connect();
    const updateData: any = { ...hotel };
    
    if (hotel.amenities) {
      if (typeof hotel.amenities === 'string') {
        updateData.amenities = hotel.amenities.split(',').map(a => a.trim()).filter(Boolean);
      } else if (Array.isArray(hotel.amenities)) {
        updateData.amenities = hotel.amenities;
      }
    }

    await this.hotels.updateOne({ id }, { $set: updateData });
    return await this.getHotel(id);
  }

  async deleteHotel(id: number): Promise<boolean> {
    await this.connect();
    const result = await this.hotels.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Hotel Users
  async getHotelUser(username: string): Promise<HotelUser | undefined> {
    await this.connect();
    const user = await this.hotelUsers.findOne({ username });
    return user || undefined;
  }

  async createHotelUser(user: InsertHotelUser): Promise<HotelUser> {
    await this.connect();
    const id = await this.getNextId(this.hotelUsers);
    const newUser: HotelUser = {
      ...user,
      id,
      createdAt: new Date(),
    };
    
    await this.hotelUsers.insertOne(newUser);
    return newUser;
  }

  async getHotelUsersByHotel(hotelId: number): Promise<HotelUser[]> {
    await this.connect();
    return await this.hotelUsers.find({ hotelId }).toArray();
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    await this.connect();
    return await this.bookings.find({}).toArray();
  }

  async getBookingsByHotel(hotelId: number): Promise<Booking[]> {
    await this.connect();
    return await this.bookings.find({ hotelId }).toArray();
  }

  async getBooking(bookingId: string): Promise<Booking | undefined> {
    await this.connect();
    const booking = await this.bookings.findOne({ bookingId });
    return booking || undefined;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    await this.connect();
    const id = await this.getNextId(this.bookings);
    const bookingId = this.generateBookingId();
    
    const newBooking: Booking = {
      ...booking,
      id,
      bookingId,
      checkInDate: new Date(booking.checkInDate),
      checkOutDate: new Date(booking.checkOutDate),
      paymentStatus: "pending",
      status: "confirmed",
      createdAt: new Date(),
    };
    
    await this.bookings.insertOne(newBooking);
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    await this.connect();
    const updateData: any = { ...booking };
    
    if (booking.checkInDate) {
      updateData.checkInDate = new Date(booking.checkInDate);
    }
    if (booking.checkOutDate) {
      updateData.checkOutDate = new Date(booking.checkOutDate);
    }

    await this.bookings.updateOne({ id }, { $set: updateData });
    const updated = await this.bookings.findOne({ id });
    return updated || undefined;
  }

  // Admins
  async getAdmin(email: string): Promise<Admin | undefined> {
    await this.connect();
    const admin = await this.admins.findOne({ email });
    return admin || undefined;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    await this.connect();
    const id = await this.getNextId(this.admins);
    const newAdmin: Admin = {
      ...admin,
      id,
      createdAt: new Date(),
    };
    
    await this.admins.insertOne(newAdmin);
    return newAdmin;
  }
}