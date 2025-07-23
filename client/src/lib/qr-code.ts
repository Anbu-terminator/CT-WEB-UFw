// QR Code generation utilities using qrcode library via CDN

declare global {
  interface Window {
    QRCode: any;
  }
}

export interface QRCodeData {
  bookingId: string;
  guestName: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
}

export function generateQRCodeData(bookingData: QRCodeData): string {
  return JSON.stringify({
    type: "BOOK_NEO_BOOKING",
    bookingId: bookingData.bookingId,
    guest: bookingData.guestName,
    hotel: bookingData.hotelName,
    checkIn: bookingData.checkInDate,
    checkOut: bookingData.checkOutDate,
    amount: bookingData.totalAmount,
    generated: new Date().toISOString()
  });
}

export async function generateQRCode(data: string, size: number = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Load QRCode library if not already loaded
      if (!window.QRCode) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.3/qrcode.min.js';
        script.onload = () => generateQRCodeInternal();
        script.onerror = () => reject(new Error('Failed to load QR code library'));
        document.head.appendChild(script);
      } else {
        generateQRCodeInternal();
      }

      function generateQRCodeInternal() {
        const canvas = document.createElement('canvas');
        window.QRCode.toCanvas(canvas, data, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }, (error: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(canvas.toDataURL());
          }
        });
      }
    } catch (error) {
      reject(error);
    }
  });
}

export function downloadQRCode(dataUrl: string, filename: string = 'booking-qr-code.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function generateAndDownloadBookingQR(bookingData: QRCodeData): Promise<void> {
  try {
    const qrData = generateQRCodeData(bookingData);
    const qrCodeDataUrl = await generateQRCode(qrData);
    const filename = `booking-${bookingData.bookingId.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    downloadQRCode(qrCodeDataUrl, filename);
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}
