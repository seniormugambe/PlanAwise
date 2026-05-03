export interface BoundlessPayConfig {
  apiKey: string;
  merchantId: string;
  environment: 'sandbox' | 'production';
  webhookUrl?: string;
  enabledFeatures: {
    payments: boolean;
    subscriptions: boolean;
    refunds: boolean;
    analytics: boolean;
  };
  paymentMethods: {
    creditCard: boolean;
    debitCard: boolean;
    bankTransfer: boolean;
    digitalWallet: boolean;
    cryptocurrency: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    encryptionLevel: 'standard' | 'enhanced';
    fraudDetection: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    webhook: boolean;
  };
}

export interface BoundlessPayTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  timestamp: Date;
  description: string;
  merchantReference?: string;
}

export interface BoundlessPayStatus {
  isConnected: boolean;
  lastSync: Date | null;
  connectionHealth: 'excellent' | 'good' | 'poor' | 'disconnected';
  apiVersion: string;
}