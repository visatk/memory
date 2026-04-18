import { CreditCard, MapPin, MessageSquare, ShieldCheck, Search } from 'lucide-react';

export const NAV_ITEMS = [
  { to: "/", icon: MessageSquare, label: "Forum", group: "Community" },
  { to: "/test-cards", icon: CreditCard, label: "Cards", group: "Utilities" },
  { to: "/card-checker", icon: ShieldCheck, label: "Checker", group: "Utilities" },
  { to: "/bin-checker", icon: Search, label: "BIN Lookup", group: "Utilities" }, // <-- Add Route
  { to: "/fake-address", icon: MapPin, label: "Addresses", group: "Utilities" },
];
