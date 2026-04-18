import { CreditCard, MapPin, MessageSquare, ShieldCheck } from 'lucide-react';

export const NAV_ITEMS = [
  { to: "/", icon: MessageSquare, label: "Forum", group: "Community" },
  { to: "/test-cards", icon: CreditCard, label: "Cards", group: "Utilities" },
  { to: "/card-checker", icon: ShieldCheck, label: "Checker", group: "Utilities" }, // <-- Add this line
  { to: "/fake-address", icon: MapPin, label: "Addresses", group: "Utilities" },
];
