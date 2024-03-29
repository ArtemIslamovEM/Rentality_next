export type TripDetails = {
  tripId: bigint;
  carId: bigint;
  status: string; //TripStatus
  guest: string;
  host: string;
  startDateTime: Date;
  endDateTime: Date;
  startLocation: string;
  endLocation: string;
  milesIncludedPerDay: number;
  fuelPricePerGalInUsd: number;
  approvedDateTime: Date | undefined;
  checkedInByHostDateTime: Date | undefined;
  startFuelLevelInGal: number | undefined;
  startOdometr: number | undefined;
  checkedInByGuestDateTime: Date | undefined;
  checkedOutByGuestDateTime: Date | undefined;
  endFuelLevelInGal: number | undefined;
  endOdometr: number | undefined;
  checkedOutByHostDateTime: Date | undefined;
  resolveAmountInUsd: number | undefined;

  paymentFrom: string;
  paymentTo: string;
  pricePerDayInUsdCents: number;
  totalDayPriceInUsd: number;
  taxPriceInUsd: number;
  depositInUsd: number;
  currencyType: number;
  ethToCurrencyRate: number;
};
