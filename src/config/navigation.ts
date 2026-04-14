import { Home, CreditCard, MapPin, MessageSquare } from 'lucide-react';

export const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Home", group: "Main" },
  { to: "/test-cards", icon: CreditCard, label: "Cards", group: "Utilities" },
  { to: "/fake-address", icon: MapPin, label: "Addresses", group: "Utilities" },
  { to: "/forum", icon: MessageSquare, label: "Forum", group: "Community" },
];
