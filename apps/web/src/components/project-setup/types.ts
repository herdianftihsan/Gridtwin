export type BuildingType = 'Ruko' | 'Residential' | 'Office';
export type ProjectObjective = 'save_money' | 'reduce_co2' | 'independence';

export interface ProjectSetupFormData {
  location: string;
  building_type: BuildingType | '';
  roof_area: number | null;
  monthly_bill: number | null;
  budget: number;
  objective: ProjectObjective;
}

export const INITIAL_FORM_DATA: ProjectSetupFormData = {
  location: 'Surabaya',
  building_type: 'Ruko',
  roof_area: null,
  monthly_bill: 4500000,
  budget: 50000000,
  objective: 'save_money',
};

export const AVAILABLE_LOCATIONS = [
  'Surabaya',
  'Jakarta',
  'Bandung',
  'Semarang',
  'Yogyakarta',
  'Denpasar',
  'Medan',
  'Makassar',
] as const;

export const BUILDING_TYPES: { value: BuildingType; label: string }[] = [
  { value: 'Ruko', label: 'Ruko / Small Commercial' },
  { value: 'Residential', label: 'Residential / Rumah Tinggal' },
  { value: 'Office', label: 'Commercial Office' },
];