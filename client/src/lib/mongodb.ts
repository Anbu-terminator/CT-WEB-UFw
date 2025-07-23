// MongoDB connection utilities for client-side operations
// Note: This is for client-side reference only, actual MongoDB operations happen server-side

export interface MongoDBConfig {
  connectionString: string;
  databaseName: string;
}

export const MONGODB_CONFIG: MongoDBConfig = {
  connectionString: import.meta.env.VITE_MONGODB_URL || "mongodb+srv://bastoffcial:aI4fEcricKXwBZ4f@speedo.swuhr8z.mongodb.net/",
  databaseName: "bookneoapp"
};

export const COLLECTIONS = {
  HOTELS: "hotels",
  HOTEL_USERS: "hotel_users", 
  BOOKINGS: "bookings",
  ADMINS: "admins"
} as const;

// Client-side MongoDB helper functions
export class MongoDBClient {
  static formatBookingId(id: number): string {
    const year = new Date().getFullYear();
    const formattedId = id.toString().padStart(3, '0');
    return `BN-${year}-${formattedId}`;
  }

  static validateBookingId(bookingId: string): boolean {
    const pattern = /^BN-\d{4}-\d{3}$/;
    return pattern.test(bookingId);
  }

  static formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Add +91 prefix if not present and number is 10 digits
    if (digits.length === 10) {
      return `+91${digits}`;
    }
    
    return phone;
  }

  static generateGuestInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  static calculateNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
