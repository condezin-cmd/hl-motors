import { Car } from "@/lib/types";

export function CarImage({
  car,
  className = "",
  rounded = "rounded-none",
}: {
  car: Car;
  className?: string;
  rounded?: string;
}) {
  const hasPhoto = car.fotos && car.fotos.length > 0;

  if (hasPhoto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={car.fotos![0]}
        alt={`${car.marca} ${car.modelo} ${car.versao}`}
        className={`${rounded} h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${rounded} relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${car.gradient[0]}, ${car.gradient[1]})`,
      }}
    >
      <div className="speedline absolute inset-0 opacity-20" />
      <CarSilhouette className="relative w-3/4 max-w-[420px] text-white/85 drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]" />
      <span className="absolute bottom-4 left-5 bg-[var(--color-red)] px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
        {car.marca}
      </span>
    </div>
  );
}

function CarSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 240" fill="none" className={className}>
      <path
        d="M44 168c-12 0-20-8-20-20v-14c0-10 6-16 16-19l60-16 70-46c14-9 30-14 47-14h120c20 0 39 7 54 20l44 38 80 14c20 4 31 16 31 35v8c0 12-8 20-20 20"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(255,255,255,0.05)"
      />
      <circle cx="170" cy="172" r="34" stroke="currentColor" strokeWidth="6" fill="rgba(0,0,0,0.3)" />
      <circle cx="170" cy="172" r="14" stroke="currentColor" strokeWidth="6" />
      <circle cx="470" cy="172" r="34" stroke="currentColor" strokeWidth="6" fill="rgba(0,0,0,0.3)" />
      <circle cx="470" cy="172" r="14" stroke="currentColor" strokeWidth="6" />
      <path d="M196 110l44-30c10-7 22-10 34-10h84c14 0 28 5 38 14l28 26" stroke="currentColor" strokeWidth="5" opacity="0.5" />
    </svg>
  );
}
