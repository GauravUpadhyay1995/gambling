interface Payment {
  _id: string;
  screen_shot: string;
}

interface DecimalValue {
  $numberDecimal: string;
}

export interface Customer {
  _id: string;
  customer: string;
  phone: string;
  fore_closure: string;
  settlement: DecimalValue;
  minimum_part_payment: DecimalValue;
  foreclosure_reward: DecimalValue;
  settlement_reward: DecimalValue;
  minimum_part_payment_reward: DecimalValue;
  payment_type: number;
  isPaid: boolean;
  payment_url: string;
  isLogin: boolean;
  last_login: string | null;
  otp: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  payments: Payment[];
}

export interface CustomerListResponse {
  totalRecords: number;
  message: string;
  success: boolean;
  data: Customer[];
  responseTime: string;
} 