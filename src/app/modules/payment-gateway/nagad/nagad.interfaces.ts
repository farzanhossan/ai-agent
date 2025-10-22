export interface INagadOptions {
  publicKey: string;
  privateKey: string;
  merchantId: string;
  merchantNumber: string;
  baseUrl: string;
}

export interface INagadPaymentGatewayResponse {
  status?: string;
  amount?: string;
  transactionMethod?: string;
  transactionId?: string;
  transactionTime?: string;
  orderId?: string;
  parentOrderId?: string;
  reason?: string;
  originUrl?: string;
  paymentType?: string;
  invoiceType?: string;
  paymentGateway?: string;
  paymentGatewayOriginalResponse?: any;
}

export interface NagadOptions {
  pgPublicKey?: string;
  merchantPrivateKey?: string;
  merchantId?: string;
  baseUrl?: string;
}

export interface INagadInitPaymentRequest {
  orderId: string;
  amount: number;
}

export interface INagadInitPaymentData {
  sensitiveData: string;
  signature: string;
  paymentReferenceId: string;
  challenge: string;
  acceptDateTime: string;
}

export interface INagadInitPaymentResponse {
  callBackUrl: string;
  paymentReferenceId: string;
}

export interface INagadPlaceOrderPaymentRequest {
  orderId: string;
  amount: number;
  paymentRefId: string;
  challenge: string;
}

export interface INagadWebHookData {
  merchant: string;
  order_id: string;
  payment_ref_id: string;
  status:
    | 'Success'
    | 'OrderInitiated'
    | 'Ready'
    | 'InProgress'
    | 'Cancelled'
    | 'InvalidRequest'
    | 'Fraud'
    | 'Aborted'
    | 'UnknownFailed';
  status_code: string;
  payment_dt: string;
  issuer_payment_ref: string;
}
