import type { MaterialCategory, ProcessingDisposition } from '../../types';

/**
 * Which grades a sorting line produces, which licensed recycler takes each grade
 * and which conversion technology that recycler runs, per material stream.
 * Demo reference data shared by the hub (sorting / dispatch) and the processor
 * (default process type) workspaces.
 */
export type ProcessType = ProcessingDisposition['processType'];

export interface MaterialRoute {
  label: string;
  processType: ProcessType;
  primary: { grade: string; processor: string };
  secondary: { grade: string; processor: string };
}

const BENGAL = 'Bengal Polymers & Flake Mill';
const MEGHNA = 'Meghna Paper & Pulp Recycling Line 2';
const TEXTILE = 'National Textile Fiber Recycling';
const SAVAR_RIGID = 'Savar Rigid Plastics Pelletizing';
const NARAYANGANJ_AL = 'Narayanganj Secondary Aluminium Smelter';

export const MATERIAL_ROUTES: Record<MaterialCategory, MaterialRoute> = {
  PET_BOTTLES: {
    label: 'PET bottles',
    processType: 'MECHANICAL_PET_FLAKING',
    primary: { grade: 'Grade A Clear Flake Precursor (Food Grade Quality)', processor: BENGAL },
    secondary: { grade: 'Color / Light Opaque Fraction', processor: TEXTILE }
  },
  HDPE_RIGID: {
    label: 'HDPE rigid',
    processType: 'HDPE_PELLETIZING',
    primary: { grade: 'Natural HDPE (Milk-Jug Grade)', processor: SAVAR_RIGID },
    secondary: { grade: 'Coloured HDPE Mix', processor: SAVAR_RIGID }
  },
  CARDBOARD_OCC: {
    label: 'Cardboard (OCC)',
    processType: 'PULPING_AND_CORRUGATING',
    primary: { grade: 'Baled OCC (Clean Corrugate)', processor: MEGHNA },
    secondary: { grade: 'Mixed Paper / Waxed Board', processor: MEGHNA }
  },
  ALUMINUM_CANS: {
    label: 'Aluminium cans',
    processType: 'ALUMINUM_SMELTING',
    primary: { grade: 'Baled UBC (Clean Cans)', processor: NARAYANGANJ_AL },
    secondary: { grade: 'Mixed Aluminium Scrap', processor: NARAYANGANJ_AL }
  },
  LDPE_FILM: {
    label: 'LDPE film',
    processType: 'HDPE_PELLETIZING',
    primary: { grade: 'Clean LDPE Film Bale', processor: SAVAR_RIGID },
    secondary: { grade: 'Printed / Laminated Film', processor: SAVAR_RIGID }
  },
  TETRAPAK_BEVERAGE: {
    label: 'Beverage cartons',
    processType: 'PULPING_AND_CORRUGATING',
    primary: { grade: 'Fibre-Rich Carton Bale', processor: MEGHNA },
    secondary: { grade: 'Poly-Aluminium Reject Fraction', processor: MEGHNA }
  }
};

export const KNOWN_PROCESSORS: string[] = Array.from(
  new Set(Object.values(MATERIAL_ROUTES).flatMap((r) => [r.primary.processor, r.secondary.processor]))
);

export const PROCESS_TYPE_LABELS: Record<ProcessType, string> = {
  MECHANICAL_PET_FLAKING: 'Mechanical Hot-Wash PET Flaking',
  HDPE_PELLETIZING: 'HDPE Extrusion & Pelletizing',
  PULPING_AND_CORRUGATING: 'Hydrapulping & Corrugating Linerboard',
  ALUMINUM_SMELTING: 'Secondary Aluminum Ingot Smelting'
};

export const routeFor = (material: MaterialCategory): MaterialRoute => MATERIAL_ROUTES[material];

/** Recycler a sorted lot was earmarked for (from its location note), else the material's primary one. */
export const defaultProcessorForLot = (lot: { material: MaterialCategory; location: string; id: string }): string => {
  const named = KNOWN_PROCESSORS.find((p) => lot.location.includes(p));
  if (named) return named;
  const route = routeFor(lot.material);
  return lot.id.endsWith('-B') ? route.secondary.processor : route.primary.processor;
};
