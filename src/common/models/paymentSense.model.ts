export type PaymentSenseData = {
  amount: number;
  transactionType: string;
  orderId: string;
  orderDescription: string;
}

export type PaymentSenseResponse = {
  id: string;
  expiresAt: number;
}
