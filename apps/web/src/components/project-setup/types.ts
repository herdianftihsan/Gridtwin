export type BuildingType = 'Ruko' | 'Residential' | 'Office';
export type ProjectObjective = 'save_money' | 'reduce_co2' | 'independence';

export interface ProjectSetupFormData {
  location: string;
  building_type: BuildingType | '';
  roof_area: number | null;
  monthly_bill: number | null;
  budget: number | null;
  objective: ProjectObjective | '';
}

export const INITIAL_FORM_DATA: ProjectSetupFormData = {
  location: '',
  building_type: '',
  roof_area: null,
  monthly_bill: null,
  budget: null,
  objective: '',
};



export const BUILDING_TYPES: { value: BuildingType; label: string }[] = [
  { value: 'Ruko', label: 'Ruko / Small Commercial' },
  { value: 'Residential', label: 'Residential / Rumah Tinggal' },
  { value: 'Office', label: 'Commercial Office' },
];