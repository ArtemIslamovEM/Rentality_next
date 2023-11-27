export type BaseCarInfo = {
  carId: number;
  ownerAddress: string;
  image: string;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  pricePerDay: number;
  securityDeposit: number;
  fuelPricePerGal: number;
  milesIncludedPerDay: number;
  currentlyListed: boolean;
};

export const getListingStatusTextFromStatus = (currentlyListed: boolean) => {
  return currentlyListed ? "Listed" : "Unlisted";
};
