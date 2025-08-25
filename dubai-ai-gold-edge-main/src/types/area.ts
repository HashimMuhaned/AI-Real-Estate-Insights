// this type is for avg. price and rent
export type Area = {
  area_id: number;
  area_name: string;
  villa_current_sale_price: number;
  villa_current_rent_price: number;
  apt_current_sale_price: number;
  apt_current_rent_price: number;
};

// this type is for rental yields
export type RentalYield = {
  area_id: number;
  area_name: string;
  villa_yield_current_year: number;
  villa_yield_last_year: number;
  villa_yield_growth_pct: number;
  apt_yield_current_year: number;
  apt_yield_last_year: number;
  apt_yield_growth_pct: number;
};

export type PriceGrowthVacancyRisk = {
  area_id: number;
  area_name: string;
  villa_price_growth_pct: number;
  apt_price_growth_pct: number;
  villa_vacancy_risk: number;
  apt_vacancy_risk: number;
};

export type TransactionsTotalValue = {
  area_id: number;
  area_name: string;
  villa_tx_all: number;
  villa_value_all: number;
  villa_tx_last_year: number;
  villa_value_last_year: number;
  apt_tx_all: number;
  apt_value_all: number;
  apt_tx_last_year: number;
  apt_value_last_year: number;
};
