export function Logo({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/hl-motors-placa.png"
        alt="HL Motors"
        className={
          compact
            ? "h-10 w-auto object-contain"
            : "h-11 w-auto max-w-[190px] object-contain sm:h-12 sm:max-w-[240px]"
        }
      />
      <span className="sr-only">HL Motors - Pinhais PR</span>
    </div>
  );
}
