// ==========================================
// RAMDOOT Foundation - Shared Enums
// Used across entities and DTOs
// ==========================================

export enum UserRole {
  USER = 'USER',
  INFLUENCER = 'INFLUENCER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
  INACTIVE = 'INACTIVE',
}

export enum MagazineStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  SUSPENDED = 'SUSPENDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  UPI = 'UPI',
  NET_BANKING = 'NET_BANKING',
  WALLET = 'WALLET',
  RAZORPAY_PAYOUT = 'RAZORPAY_PAYOUT',
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum OtpPurpose {
  SIGNUP = 'SIGNUP',
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_CHANGE = 'EMAIL_CHANGE',
  TWO_FA = 'TWO_FA',
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export enum SharingMedium {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  WHATSAPP = 'whatsapp',
  TWITTER = 'twitter',
}
