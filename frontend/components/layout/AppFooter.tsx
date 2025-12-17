export function AppFooter() {
  return (
    <footer className='border-t py-6 md:py-0 mt-auto bg-muted/30'>
      <div className='container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row max-w-screen-xl mx-auto px-4'>
        <p className='text-center text-sm leading-loose text-muted-foreground md:text-left'>
          Built for <strong>Bildverarbeitung</strong> Exercises. Synthetic Image
          Detection using Gradient Fields.
        </p>
      </div>
    </footer>
  );
}
