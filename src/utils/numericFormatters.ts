export const currencyFormat = (value: number | bigint) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export const getIntFromString = (text: string) => {
  return Number(text.replace(/[^\d.-]+/g, ""));
};

export const getUIntFromString = (text: string) => {
  return Number(text.replace(/[^\d.]+/g, ""));
};

export const formatEthWithDecimals = (value: bigint, decimals: bigint) => {
  return `${Number(value) / 10 ** Number(decimals)}`;
};

export const decimalToHex = (decimalValue: string): string | null => {
  const decimalNumber = Number(decimalValue);

  if (!isNaN(decimalNumber)) {
    return decimalNumber.toString(16);
  } else {
    console.error("Invalid input. Please provide a valid decimal number.");
    return null;
  }
};
