export interface IRazorpayOptions {
  keyId: string;
  keySecret: string;
}

export interface IRazorpayTokenResponse {
  statusCode: string;
  statusMessage: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface Customer {
  name?: string;
  email?: string;
  contact?: string;
}

interface CallbackUrl {
  url: string;
  method: string;
}

export interface IRazorpayInitPaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customer: Customer;
  callbackUrl?: CallbackUrl;
}
export interface IRazorpayRefundTransaction {
  paymentID: string;
  amount: number;
  trxID: string;
  sku: string;
  reason: string;
}
export interface IRazorpayRefundTransactionResponse {
  completedTime: string;
  transactionStatus: string;
  originalTrxID: string;
  refundTrxID: string;
  amount: number;
  currency: string;
  charge: string;
  statusCode: string;
}

export interface IRazorpayPaymentGatewayResponse {
  accept_partial?: boolean;
  amount?: number | string;
  amount_paid?: number;
  callback_method?: string;
  callback_url?: string;
  cancelled_at?: number;
  created_at?: any;
  currency?: string;
  customer?: {
    contact?: string | number;
    email?: string;
    name?: string;
  };
  description?: string;
  expire_by?: number;
  expired_at?: number;
  first_min_partial_amount?: number;
  id?: string;
  notes?: {
    policy_name?: string;
  };
  notify?: {
    email?: boolean;
    sms?: boolean;
    whatsapp?: boolean;
  };
  payments?: any; // You might want to replace 'any' with the actual type if you know it
  reference_id?: string;
  reminder_enable?: boolean;
  reminders?: any; // You might want to replace 'any' with the actual type if you know it
  short_url?: string;
  status?: string;
  updated_at?: number;
  upi_link?: boolean;
  user_id?: string;
  whatsapp_link?: boolean;
}

export interface IRazorpayWebHookDataFromCallback {
  razorpay_payment_id: string;
  razorpay_payment_link_id: string;
  razorpay_payment_link_reference_id: string;
  razorpay_payment_link_status: string;
  razorpay_signature: string;
}

export interface IRazorpayWebHookData {
  account_id?: string;
  contains?: string[];
  created_at?: number;
  entity?: string;
  event?: string;
  payload?: {
    order?: {
      entity?: {
        amount?: number;
        amount_due?: number;
        amount_paid?: number;
        attempts?: number;
        created_at?: number;
        currency?: string;
        entity?: string;
        id?: string;
        notes?: {
          policy_name?: string;
        };
        offer_id?: string | null;
        receipt?: string;
        status?: string;
      };
    };
    payment?: {
      entity?: {
        acquirer_data?: {
          bank_transaction_id?: string;
        };
        amount?: number;
        amount_refunded?: number;
        amount_transferred?: number;
        bank?: string;
        base_amount?: number;
        captured?: boolean;
        card?: string | null;
        card_id?: string | null;
        contact?: string;
        created_at?: number;
        currency?: string;
        description?: string;
        email?: string;
        entity?: string;
        error_code?: string | null;
        error_description?: string | null;
        error_reason?: string | null;
        error_source?: string | null;
        error_step?: string | null;
        fee?: number;
        fee_bearer?: string;
        id?: string;
        international?: boolean;
        invoice_id?: string | null;
        method?: string;
        notes?: {
          policy_name?: string;
        };
        order_id?: string;
        refund_status?: string | null;
        status?: string;
        tax?: number;
        vpa?: string | null;
        wallet?: string | null;
      };
    };
    payment_link?: {
      entity?: {
        accept_partial?: boolean;
        amount?: number;
        amount_paid?: number;
        callback_method?: string;
        callback_url?: string;
        cancelled_at?: number;
        created_at?: number;
        currency?: string;
        customer?: {
          contact?: string;
          email?: string;
          name?: string;
        };
        description?: string;
        expire_by?: number;
        expired_at?: number;
        first_min_partial_amount?: number;
        id?: string;
        notes?: {
          policy_name?: string;
        };
        notify?: {
          email?: boolean;
          sms?: boolean;
          whatsapp?: boolean;
        };
        order_id?: string;
        reference_id?: string;
        reminder_enable?: boolean;
        reminders?: {
          status?: string;
        };
        short_url?: string;
        status?: string;
        updated_at?: number;
        upi_link?: boolean;
        user_id?: string;
        whatsapp_link?: boolean;
      };
    };
  };
}

export interface IRazorpayExecuteResponse {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  payerReference: string;
  customerMsisdn: string;
  trxID: string;
  amount: string;
  transactionStatus: string;
  paymentExecuteTime: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
}

export interface IRazorpayQueryResponse {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  mode: string;
  paymentCreateTime: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoice: string;
  transactionStatus: string;
  verificationStatus: string;
  payerReference: string;
  agreementID: string;
  agreementStatus: string;
  agreementCreateTime: string;
  agreementExecuteTime: string;
}
