import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHotelSchema, insertBookingSchema, insertHotelUserSchema } from "@shared/schema";
import { z } from "zod";
import { RazorpayService } from "./services/razorpay";
import { EmailService } from "./services/email";

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const bookingCreateSchema = insertBookingSchema.extend({
  guestName: z.string().min(1),
  guestContact: z.string().min(10),
  checkInDate: z.string().transform(str => new Date(str)),
  checkOutDate: z.string().transform(str => new Date(str)),
});

const razorpayService = new RazorpayService();

// Add TypeScript type for Razorpay webhook payload
interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: {
        id: string;
        status: string;
        order_id: string;
      };
    };
    order: {
      entity: {
        id: string;
        notes: {
          bookingId?: string;
        };
      };
    };
  };
}
const emailService = new EmailService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Hotels
  app.get("/api/hotels", async (req: Request, res: Response) => {
    try {
      const hotels = await storage.getHotels();
      res.json(hotels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotels" });
    }
  });

  app.get("/api/hotels/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const hotel = await storage.getHotel(id);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel" });
    }
  });

  app.post("/api/hotels", async (req, res) => {
    try {
      const hotelData = insertHotelSchema.parse(req.body);
      const hotel = await storage.createHotel(hotelData);
      res.status(201).json(hotel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid hotel data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create hotel" });
    }
  });

  app.put("/api/hotels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hotelData = insertHotelSchema.partial().parse(req.body);
      const hotel = await storage.updateHotel(id, hotelData);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid hotel data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update hotel" });
    }
  });

  app.delete("/api/hotels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHotel(id);
      if (!success) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json({ message: "Hotel deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete hotel" });
    }
  });

  // Hotel Authentication
  app.post("/api/auth/hotel/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getHotelUser(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const hotel = await storage.getHotel(user.hotelId);
      res.json({ user, hotel });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin Authentication
  app.post("/api/auth/admin/login", async (req, res) => {
    try {
      const { email, password } = adminLoginSchema.parse(req.body);
      const admin = await storage.getAdmin(email);
      
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ admin });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Bookings
  app.get("/api/bookings", async (req, res) => {
    try {
      const { hotelId } = req.query;
      let bookings;
      
      if (hotelId) {
        bookings = await storage.getBookingsByHotel(parseInt(hotelId as string));
      } else {
        bookings = await storage.getBookings();
      }
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const bookingId = req.params.id;
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = bookingCreateSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id/payment", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { paymentStatus, transactionId, cashfreeOrderId } = req.body;
      
      const booking = await storage.updateBooking(id, {
        paymentStatus,
        transactionId,
        cashfreeOrderId,
      });
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking payment" });
    }
  });

  // Hotel Users
  app.post("/api/hotel-users", async (req, res) => {
    try {
      const userData = insertHotelUserSchema.parse(req.body);
      const user = await storage.createHotelUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create hotel user" });
    }
  });

  // Razorpay Payment Integration
  app.post("/api/razorpay/create-order", async (req, res) => {
    try {
      const { amount, currency, receipt, notes } = req.body;
      
      const orderData = {
        amount,
        currency: currency || "INR",
        receipt,
        notes
      };

      const order = await razorpayService.createOrder(orderData);
      res.json({ id: order.id, amount: order.amount });
    } catch (error) {
      console.error("Cashfree order creation error:", error);
      res.status(500).json({ message: "Failed to create payment order" });
    }
  });

  app.get("/api/razorpay/order/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const orderDetails = await razorpayService.verifyPayment(orderId);
      res.json(orderDetails);
    } catch (error) {
      console.error("Cashfree order fetch error:", error);
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });

  // Cashfree webhook endpoint
  app.post("/api/webhooks/razorpay", async (req: Request, res: Response) => {
    try {
      const payload: RazorpayWebhookPayload = req.body;
      const signature = req.headers['x-razorpay-signature'];
      
      if (!razorpayService.verifyWebhookSignature(JSON.stringify(payload), signature, process.env.RAZORPAY_WEBHOOK_SECRET || "")) {
        return res.status(401).json({ message: "Invalid signature" });
      }

      const payment = payload.payload.payment.entity;
      const order = payload.payload.order.entity;
      const bookingId = order.notes?.bookingId;

      console.log("Razorpay webhook received:", { payment_id: payment.id, status: payment.status });

      if (bookingId) {
        const booking = await storage.getBooking(bookingId);
        if (booking) {
          const updatedBooking = await storage.updateBooking(booking.id, {
            paymentStatus: payment.status === "captured" ? "completed" : "failed",
            transactionId: payment.id,
          });

        // Send confirmation email on successful payment
        if (payment.status === "captured" && updatedBooking) {
          try {
            const hotel = await storage.getHotel(booking.hotelId);
            if (hotel) {
              await emailService.sendBookingConfirmation({
                guestEmail: `${booking.guestContact}@bookneoapp.com`, // Fallback email
                guestName: booking.guestName,
                bookingId: booking.bookingId,
                hotelName: hotel.name,
                checkInDate: booking.checkInDate.toISOString().split('T')[0],
                checkOutDate: booking.checkOutDate.toISOString().split('T')[0],
                totalAmount: booking.totalAmount,
              });
            }
          } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
            // Don't fail the webhook for email errors
          }
        }
      }
      
      res.json({ status: "success" });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Email confirmation endpoint
  app.post("/api/bookings/:id/send-confirmation", async (req, res) => {
    try {
      const bookingId = req.params.id;
      const { email } = req.body;
      
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const hotel = await storage.getHotel(booking.hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      await emailService.sendBookingConfirmation({
        guestEmail: email,
        guestName: booking.guestName,
        bookingId: booking.bookingId,
        hotelName: hotel.name,
        checkInDate: booking.checkInDate.toISOString().split('T')[0],
        checkOutDate: booking.checkOutDate.toISOString().split('T')[0],
        totalAmount: booking.totalAmount,
      });

      res.json({ message: "Confirmation email sent successfully" });
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ message: "Failed to send confirmation email" });
    }
  });

  // QR Code generation endpoint
  app.get("/api/bookings/:id/qr", async (req, res) => {
    try {
      const bookingId = req.params.id;
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const hotel = await storage.getHotel(booking.hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const qrData = {
        type: "BOOK_NEO_BOOKING",
        bookingId: booking.bookingId,
        guest: booking.guestName,
        hotel: hotel.name,
        checkIn: booking.checkInDate.toISOString().split('T')[0],
        checkOut: booking.checkOutDate.toISOString().split('T')[0],
        amount: booking.totalAmount,
        generated: new Date().toISOString()
      };

      res.json(qrData);
    } catch (error) {
      console.error("QR code generation error:", error);
      res.status(500).json({ message: "Failed to generate QR code data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
