import { ShieldCheck, CreditCard, Terminal, MapPin, MessageSquare, Send } from 'lucide-react';

export interface NavItem {
  to: string;
  icon: any;
  label: string;
  group: 'Utilities' | 'Community';
  external?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/card-checker', icon: ShieldCheck, label: 'Live Gateway', group: 'Utilities' },
  { to: '/bin-checker', icon: CreditCard, label: 'BIN Lookup', group: 'Utilities' },
  { to: '/test-cards', icon: Terminal, label: 'Vector Gen', group: 'Utilities' },
  { to: '/fake-address', icon: MapPin, label: 'Mock Identity', group: 'Utilities' },
  
  { to: '/forum', icon: MessageSquare, label: 'Discussion Board', group: 'Community' },
  // Native Telegram Promotion
  { to: 'https://t.me/drkingbd', icon: Send, label: 'Telegram Channel', group: 'Community', external: true }
];
