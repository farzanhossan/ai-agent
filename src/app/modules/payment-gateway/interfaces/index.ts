export interface IamarPaySuccessPayload {
  pg_service_charge_bdt?: string;
  amount_original?: string;
  pg_service_charge_usd?: string;
  pg_card_bank_name?: string;
  pg_card_bank_country?: string;
  card_number?: string;
  status_code?: string;
  pay_status?: string;
  success_url?: string;
  fail_url?: string;
  cus_name?: string;
  cus_email?: string;
  cus_phone?: string;
  currency_merchant?: string;
  ip_address?: string;
  other_currency?: string;
  pg_txnid?: string;
  epw_txnid?: string;
  mer_txnid?: string;
  store_id?: string;
  merchant_id?: string;
  currency?: string;
  store_amount?: string;
  pay_time?: string;
  amount?: string;
  bank_txn?: string;
  card_type?: string;
  reason?: string;
  pg_card_risklevel?: string;
  pg_error_code_details?: string;
  opt_a?: string;
  opt_b?: string;
  opt_c?: string;
}

export interface IamarPayFailPayload {
  pg_service_charge_bdt?: string;
  success_url?: string;
  fail_url?: string;
  cus_name?: string;
  cus_email?: string;
  cus_phone?: string;
  currency_merchant?: string;
  ip_address?: string;
  other_currency?: string;
  pay_status?: string;
  pg_txnid?: string;
  epw_txnid?: string;
  mer_txnid?: string;
  store_id?: string;
  merchant_id?: string;
  currency?: string;
  store_amount?: string;
  pay_time?: string;
  amount?: string;
  card_type?: string;
  reason?: string;
  pg_card_risklevel?: string;
  pg_error_code_details?: string;
  opt_a?: string;
  opt_b?: string;
  opt_c?: string;
}

export interface IPaymentGatewayResponse {
  status?: string;
  amount?: string | number;
  transactionMethod?: string;
  transactionId?: string;
  transactionTime?: string;
  orderId?: string;
  applicationId?: number;
  applicationUnifiedCode?: string;
  reason?: string;
  originUrl?: string;
  paymentIssuer?: string;
  paymentMethod?: string;
  paymentCurrency?: string;
  paymentGateway?: string;
  paymentGatewayRequestResponse?: any;
  paymentGatewayOriginalResponse?: any;
  isSuccess?: boolean;
}

export interface IExtraPaymentRequestOptions {
  customerAddress1?: string;
  customerAddress2?: string;
  customerCity?: string;
  customerCountry?: string;
}
