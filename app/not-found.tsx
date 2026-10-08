import { Button } from '@/components/Button';

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[80vh] flex-col items-center justify-center pt-16 text-center">
      <p className="text-gradient text-7xl font-semibold tracking-tight">404</p>
      <h1 className="mt-4 text-2xl font-semibold">This page doesn&apos;t exist</h1>
      <p className="mt-2 text-muted">The link may be broken or the page may have moved.</p>
      <div className="mt-8 flex gap-3">
        <Button href="/">Go home</Button>
        <Button href="/creators" variant="outline">
          Explore creators
        </Button>
      </div>
    </div>
  );
}
