import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="bg-background border-t">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <div className="text-sm font-semibold">The Mind Point</div>
          <p className="text-muted-foreground text-sm">
            Holistic, practitioner-led learning for mind and wellbeing.
          </p>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Programs</div>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>
              <Link href="/courses" className="hover:underline">
                Courses
              </Link>
            </li>
            <li>
              <Link href="/workshops" className="hover:underline">
                Workshops
              </Link>
            </li>
            <li>
              <Link href="/events" className="hover:underline">
                Events
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Company</div>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/community" className="hover:underline">
                Community
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Legal</div>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>
              <Link href="/toc" className="hover:underline">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/refund" className="hover:underline">
                Refund
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="text-muted-foreground container flex h-12 items-center justify-between text-xs">
          <p>
            © {new Date().getFullYear()} The Mind Point. All rights reserved.
          </p>
          <p>Made with care.</p>
        </div>
      </div>
    </footer>
  );
}
