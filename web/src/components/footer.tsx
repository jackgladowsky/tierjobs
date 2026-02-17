import Link from 'next/link';
import { Trophy } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-400">
                <Trophy className="h-5 w-5 text-black" />
              </div>
              <span className="font-bold text-xl">
                Tier<span className="text-amber-500">Jobs</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Find your next role at top-tier tech companies. Jobs ranked by company prestige and compensation.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3">Browse</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/jobs" className="hover:text-foreground transition-colors">
                  All Jobs
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-foreground transition-colors">
                  Companies
                </Link>
              </li>
              <li>
                <Link href="/jobs?tier=S+" className="hover:text-foreground transition-colors">
                  S+ Tier Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs?remote=Remote" className="hover:text-foreground transition-colors">
                  Remote Jobs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TierJobs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
