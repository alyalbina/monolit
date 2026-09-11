import { WalletView } from './WalletView';
import * as F from '@/adapters/demo/fixture';

/** Static export needs a known set of params. The fixture wallet plus every counterparty it links to,
 *  so the result table's identity links resolve in the preview. */
export function generateStaticParams() {
  const addresses = [F.WALLET.full, ...F.FUNDERS.map(f => f.full)];
  return addresses.map(address => ({ chainId: 'solana', address }));
}
export const dynamicParams = false;

export default function Page() {
  return <WalletView />;
}
