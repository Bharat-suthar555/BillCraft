// Next.js re-mounts this on every navigation (unlike layout.tsx, which
// persists), so the entrance animation replays on each page change —
// giving route transitions a soft fade/rise instead of an abrupt cut.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className='animate-rise'>{children}</div>;
}
