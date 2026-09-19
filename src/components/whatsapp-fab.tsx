
import { Button } from "./ui/button";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );

export default function WhatsAppFAB() {
  return (
    <Button
      asChild
      size="icon"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600"
      aria-label="Chat on WhatsApp"
    >
      <a href="https://wa.me/918874620222" target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </Button>
  );
}
