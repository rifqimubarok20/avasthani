// =============================================================================
// Avasthani - Tipe data TypeScript shared
// Sumber kebenaran: PRD.md dan DESIGN.md (model data Firestore).
// =============================================================================

export type Role = 'BUYER' | 'SUPPLIER' | 'OPERATOR' | 'SUPER_ADMIN';

export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';

export type BusinessType = 'BUYER' | 'SUPPLIER' | 'MIXED';

export type BusinessVerificationStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED';

export type ProductReviewStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type ProductAvailability =
  | 'AVAILABLE'
  | 'LIMITED'
  | 'UNAVAILABLE';

export type PurchaseRequestStatus =
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'SOURCING'
  | 'OFFERED'
  | 'CONVERTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type SupplierOfferStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type BuyerQuoteStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'WITHDRAWN';

export type OrderCostType =
  | 'supplier'
  | 'logistics'
  | 'sorting'
  | 'shrinkage'
  | 'payment'
  | 'other';

export interface UserProfile {
  uid: string;
  displayName: string;
  phoneNumber?: string;
  email?: string;
  photoURL?: string;
  status: UserStatus;
  businessIds: string[];
  preferredRole?: Role;
  createdAt: any; // Firestore Timestamp
  updatedAt: any;
}

export interface BusinessAddress {
  province: string;
  city: string;
  district?: string;
  village?: string;
  addressLine?: string;
  latitude?: number;
  longitude?: number;
}

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  ownerUid: string;
  memberUids: string[];
  phone?: string;
  address: BusinessAddress;
  verificationStatus: BusinessVerificationStatus;
  createdAt: any;
  updatedAt: any;
}

export interface Category {
  id: string;
  name: string;
  active: boolean;
  sortOrder: number;
  parentId?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Unit {
  id: string;
  name: string; // kg, gram, ikat, karung, peti, dll.
  createdAt: any;
  updatedAt: any;
}

export interface Product {
  id: string;
  supplierBusinessId: string;
  createdByUid: string;
  name: string;
  categoryId: string;
  description?: string;
  images: string[];
  baseUnit: string;
  grade?: string;
  indicativeStock?: number;
  indicativePricePerUnit?: number;
  availabilityStatus: ProductAvailability;
  reviewStatus: ProductReviewStatus;
  reviewNote?: string;
  location: { city: string; district?: string };
  createdAt: any;
  updatedAt: any;
}

export interface PurchaseRequest {
  id: string;
  buyerBusinessId: string;
  createdBy: string;
  productId?: string;
  productNameSnapshot: string;
  quantity: number;
  unit: string;
  gradeOrSpecification?: string;
  targetPricePerUnit?: number;
  deliveryLocation: {
    city: string;
    district?: string;
    addressLine?: string;
  };
  neededBy: any;
  notes?: string;
  status: PurchaseRequestStatus;
  assignedOperatorUid?: string;
  createdAt: any;
  updatedAt: any;
}

export interface SupplierOffer {
  id: string;
  requestId: string;
  supplierBusinessId: string;
  quantityAvailable: number;
  unit: string;
  supplierPricePerUnit: number;
  gradeOrSpecification?: string;
  availableUntil?: any;
  estimatedReadyAt?: any;
  notes?: string;
  status: SupplierOfferStatus;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

export interface BuyerQuoteItem {
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  gradeOrSpecification?: string;
}

export interface BuyerQuote {
  id: string;
  requestId: string;
  buyerBusinessId: string;
  createdByOperatorUid: string;
  items: BuyerQuoteItem[];
  deliveryFee: number;
  otherFees: number;
  discount: number;
  totalAmount: number;
  currency: 'IDR';
  terms: string;
  validUntil: any;
  status: BuyerQuoteStatus;
  createdAt: any;
  updatedAt: any;
}

export interface OrderItemSnapshot {
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  gradeOrSpecification?: string;
}

export interface OrderDeliverySnapshot {
  fee: number;
  address: string;
  scheduledAt?: any;
}

export interface Order {
  id: string;
  orderNumber: string;
  requestId: string;
  quoteId: string;
  buyerBusinessId: string;
  supplierBusinessIds: string[];
  status: string;
  currency: 'IDR';
  itemsSnapshot: OrderItemSnapshot[];
  deliverySnapshot: OrderDeliverySnapshot;
  subtotal: number;
  otherFees: number;
  discount: number;
  totalAmount: number;
  acceptedAt: any;
  completedAt?: any;
  createdAt: any;
  updatedAt: any;
}

export interface OrderCost {
  id: string;
  orderId: string;
  costType: OrderCostType;
  amount: number;
  currency: 'IDR';
  notes?: string;
  createdBy: string;
  createdAt: any;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  read: boolean;
  createdAt: any;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  createdAt: any;
  requestId?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  lastKey: string | null;
  hasMore: boolean;
}
