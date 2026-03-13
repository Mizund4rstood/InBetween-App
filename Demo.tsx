import Onboarding from '@/components/Onboarding';

/**
 * Dev-only route to preview onboarding steps without authentication.
 * Guarded: only available in development mode.
 */
export default function Demo() {
  if (import.meta.env.PROD) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground">Not available in production.</p>
      </div>
    );
  }

  return <Onboarding demoMode />;
}
