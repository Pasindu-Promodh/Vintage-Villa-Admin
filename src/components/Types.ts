export interface Booking {
    id: string;
    roomTitle: string;
    checkInDate: string;
    checkOutDate: string;
    headCount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    preferredContactMethod: "whatsapp" | "email";
    mealOptions: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
    };
    discount: number;
    totalPrice: number;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    createdAt: any;
  }

 export interface Room {
    id: string;
    title: string;
    description: string;
    price: number;
    price_extra: number;
    image: string;
    isActive: boolean;
    displayOrder: number;
    capacity: number;
    amenities: string[];
    lastUpdated: number;
  }

  export interface RoomDialogProps {
    open: boolean;
    formData: Omit<Room, 'id' | 'lastUpdated'>;
    onClose: () => void;
    onInputChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAmenitiesChange: (amenities: string[]) => void;
    onSubmit: () => void;
  }
  

  export interface PricingSettings {
    lunchPrice: number;
    dinnerPrice: number;
    discountRate: number;
    lastUpdated: number;
  }

  export interface UnavailableDates {
    id: string;
    startDate: string;
    endDate: string;
    reason?: string;
    createdAt: string;
    // "all" = blocks every room; a specific room id = blocks only that room.
    // Omitted on older records, which are treated as "all" for backward compatibility.
    roomId?: string;
    roomTitle?: string;
  }