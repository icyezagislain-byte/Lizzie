import { Link } from 'wouter';
import { Eye } from 'lucide-react';

export function Mark({ small = false }: { small?: boolean }) {
  return <span className={`brand-mark ${small ? 'brand-mark-small' : ''}`} aria-hidden="true"><svg viewBox="0 0 52 52" fill="none"><circle cx="22" cy="22" r="15.5" stroke="currentColor" strokeWidth="2.4"/><path d="m33.5 33.5 11 11" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round"/><path d="M12.3 22s3.7-6.1 9.7-6.1 9.7 6.1 9.7 6.1-3.7 6.1-9.7 6.1-9.7-6.1-9.7-6.1Z" stroke="currentColor" strokeWidth="1.8"/><circle cx="22" cy="22" r="2.4" fill="currentColor"/></svg></span>;
}
export function Brand() {
  return <Link href="/" className="brand" aria-label="The Detectives home" data-testid="link-home"><Mark/><span>THE<br className="brand-break"/> DETECTIVES</span></Link>;
}
export function SiteHeader() {
  return <header className="site-header"><div className="header-inner"><Brand/><nav className="site-nav" aria-label="Main navigation"><a href="/#research" data-testid="link-research">Research</a><Link href="/interview" data-testid="link-start-interview">Start an interview</Link><Link href="/admin" data-testid="link-admin-access" className="nav-admin"><Eye size={15}/> Admin access</Link></nav></div></header>;
}
