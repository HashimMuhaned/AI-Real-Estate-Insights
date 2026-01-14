export type Project = {
  id: number;
  name: string;
  num_rooms_en: string | null;
  type:
    | "Apartment"
    | "Stacked Townhouses"
    | "Villa"
    | "Office"
    | "Shop"
    | "Hotel Apartment"
    | "Hotel Rooms";
  transferType: string;
  property_usage: string;
  reg_type: string;
  salesVolume: number;
  avgPricePerSqft: number;
  rn: number;
};
