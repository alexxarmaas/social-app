export default function Loading() {
  return <main className="min-h-screen bg-zinc-950 px-5 py-16"><div className="mx-auto max-w-7xl animate-pulse"><div className="h-3 w-32 rounded bg-zinc-800" /><div className="mt-5 h-14 max-w-xl rounded-2xl bg-zinc-900" /><div className="mt-10 grid gap-5 md:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="h-80 rounded-[2rem] border border-zinc-900 bg-zinc-900/60" />)}</div></div></main>;
}
