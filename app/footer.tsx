import { Facebook, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-background text-foreground bottom-0 flex flex-col items-center justify-center gap-4 border-t border-black p-4">
      <p className="flex flex-row gap-4">
        <Link href="https://instagram.com/themindpoint?igshid=YmMyMTA2M2Y=">
          <Instagram />
        </Link>
        <Link href="https://www.facebook.com/themindpoint?mibextid=LQQJ4d">
          <Facebook />
        </Link>
      </p>
      <p>
        Copyright © {new Date().getFullYear()} The Mind Point. All rights
        reserved.
      </p>
    </footer>
  );
}
