import type { PaymentMethod, PaymentProvider } from './types';
import { CashProvider } from './cash-provider';
import { CardProvider } from './card-provider';
import { WalletProvider } from './wallet-provider';

const providers: Record<PaymentMethod, PaymentProvider> = {
  CASH: new CashProvider(),
  CARD: new CardProvider(),
  WALLET: new WalletProvider(),
};

export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  const provider = providers[method];
  if (!provider) {
    throw new Error(`Unsupported payment method: ${method}`);
  }
  return provider;
}

export type { PaymentMethod, PaymentProvider, PaymentRequest, PaymentResult, RefundResult } from './types';
