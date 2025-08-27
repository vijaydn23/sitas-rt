// D:\sitas-rt\src\lib\ndt.ts
export type Isotope = 'Ir-192' | 'Co-60';

const HALF_LIFE_DAYS: Record<Isotope, number> = {
  'Ir-192': 73.83,
  'Co-60' : 5.271 * 365.25
};

/** Decay: A = A0 * 0.5^(Δt / T_half) */
export function decayedActivityMbq(a0_mbq: number, refDate: string | Date, at: Date, isotope: Isotope) {
  const ref = new Date(refDate);
  const dtDays = (at.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24);
  const hl = HALF_LIFE_DAYS[isotope];
  return a0_mbq * Math.pow(0.5, dtDays / hl);
}

/**
 * Example model (tune with your real chart):
 * t[s] = (K * thickness^alpha * (SFD[m])^2 * total_film) / A_eff[MBq]
 */
export function exposureSeconds(
  K: number,
  alpha: number,
  thickness_mm: number,
  sfd_mm: number,
  total_film: number,
  A_eff_mbq: number
) {
  if (A_eff_mbq <= 0) return 0;
  const thicknessTerm = Math.pow(Math.max(thickness_mm, 0.001), alpha || 0);
  const distanceTermMetersSq = Math.pow(sfd_mm / 1000, 2);
  return (K * thicknessTerm * distanceTermMetersSq * Math.max(total_film, 1)) / A_eff_mbq;
}
