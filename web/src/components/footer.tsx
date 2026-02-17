import Link from 'next/link';
import { Sparkles, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#08080c]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">
                Tier<span className="text-indigo-400">Jobs</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 max-w-xs leading-relaxed">
              Find your dream role at elite tech companies. Every company ranked, every opportunity scored.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/jobs" className="text-sm text-white/50 hover:text-white transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/companies" className="text-sm text-white/50 hover:text-white transition-colors">
                  Companies
                </Link>
              </li>
              <li>
                <Link href="/tier-list" className="text-sm text-white/50 hover:text-white transition-colors">
                  Tier List Maker
                </Link>
              </li>
              <li>
                <Link href="/jobs?level=intern" className="text-sm text-white/50 hover:text-white transition-colors">
                  Internships
                </Link>
              </li>
              <li>
                <Link href="/jobs?level=new_grad" className="text-sm text-white/50 hover:text-white transition-colors">
                  New Grad Roles
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-white/50 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a href="https://twitter.com/tierjobs" target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1">
                  <Twitter className="h-3.5 w-3.5" />
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://github.com/jackgladowsky/tierjobs" target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1">
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} TierJobs. Built by Jack Gladowsky.
          </p>
          <p className="text-xs text-white/30">
            Data refreshed daily. Not affiliated with listed companies.
          </p>
        </div>
      </div>
    </footer>
  );
}
