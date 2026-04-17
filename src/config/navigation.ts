import { CreditCard, MapPin, MessageSquare } from 'lucide-react';

export const NAV_ITEMS = [
  { to: "/", icon: MessageSquare, label: "Forum", group: "Community" },
  { to: "/test-cards", icon: CreditCard, label: "Cards", group: "Utilities" },
  { to: "/fake-address", icon: MapPin, label: "Addresses", group: "Utilities" },
];
