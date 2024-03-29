import { Contract, ethers } from "ethers";
import { useState } from "react";
import { rentalityJSON } from "../../abis";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../../utils/pinata";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractCreateCarRequest } from "@/model/blockchain/ContractCreateCarRequest";
import { HostCarInfo, verifyCar } from "@/model/HostCarInfo";
import { isEmpty } from "@/utils/string";
import { useRentality } from "@/contexts/rentalityContext";

const emptyNewCarInfo = {
  carId: 0,
  ownerAddress: "",
  vinNumber: "",
  brand: "",
  model: "",
  releaseYear: "",
  image: "",
  name: "",
  licensePlate: "",
  licenseState: "",
  seatsNumber: "",
  doorsNumber: "",
  fuelType: "",
  tankVolumeInGal: "",
  wheelDrive: "",
  transmission: "",
  trunkSize: "",
  color: "",
  bodyType: "",
  description: "",
  pricePerDay: "",
  milesIncludedPerDay: "",
  securityDeposit: "",
  fuelPricePerGal: "",
  country: "",
  state: "",
  city: "",
  locationLatitude: "",
  locationLongitude: "",
};

const useAddCar = () => {
  const rentalityInfo = useRentality();
  const [carInfoFormParams, setCarInfoFormParams] = useState<HostCarInfo>(emptyNewCarInfo);
  const [dataSaved, setDataSaved] = useState<Boolean>(true);

  const uploadMetadataToIPFS = async ({
    vinNumber,
    brand,
    model,
    releaseYear,
    image,
    name,
    licensePlate,
    licenseState,
    seatsNumber,
    doorsNumber,
    fuelType,
    tankVolumeInGal,
    wheelDrive,
    transmission,
    trunkSize,
    color,
    bodyType,
    description,
  }: HostCarInfo) => {
    if (!verifyCar(carInfoFormParams)) {
      return;
    }

    const attributes = [
      {
        trait_type: "VIN number",
        value: vinNumber,
      },
      {
        trait_type: "License plate",
        value: licensePlate,
      },
      {
        trait_type: "License state",
        value: licenseState,
      },
      // {
      //   trait_type: "State",
      //   value: state,
      // },
      {
        trait_type: "Brand",
        value: brand,
      },
      {
        trait_type: "Model",
        value: model,
      },
      {
        trait_type: "Release year",
        value: releaseYear,
      },
      {
        trait_type: "Body type",
        value: bodyType,
      },
      {
        trait_type: "Color",
        value: color,
      },
      {
        trait_type: "Doors number",
        value: doorsNumber,
      },
      {
        trait_type: "Seats number",
        value: seatsNumber,
      },
      {
        trait_type: "Trunk size",
        value: trunkSize,
      },
      {
        trait_type: "Transmission",
        value: transmission,
      },
      {
        trait_type: "Wheel drive",
        value: wheelDrive,
      },
      {
        trait_type: "Fuel type",
        value: fuelType,
      },
      {
        trait_type: "Tank volume(gal)",
        value: tankVolumeInGal,
      },
      // {
      //   trait_type: "Distance included(mi)",
      //   value: milesIncludedPerDay,
      // },
      // {
      //   trait_type: "Price per Day (USD cents)",
      //   value: pricePerDay,
      // }
    ];
    const nftJSON = {
      name,
      description,
      image,
      attributes,
    };

    try {
      //upload the metadata JSON to IPFS
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        return response.pinataURL;
      }
    } catch (e) {
      console.error("error uploading JSON metadata:", e);
    }
  };

  const saveCar = async (image: File) => {
    if (!rentalityInfo) {
      console.error("saveCar error: rentalityInfo is null");
      return false;
    }

    try {
      setDataSaved(false);
      const response = await uploadFileToIPFS(image);

      if (response.success !== true) {
        console.error("Uploaded image to Pinata error");

        setDataSaved(true);
        return false;
      }

      console.log("Uploaded image to Pinata: ", response.pinataURL);
      const dataToSave = {
        ...carInfoFormParams,
        image: response.pinataURL,
      };

      const metadataURL = await uploadMetadataToIPFS(dataToSave);

      var pricePerDayDouble = Number(dataToSave.pricePerDay.replace(/[^0-9.]+/g, ""));
      const pricePerDayInUsdCents = BigInt((pricePerDayDouble * 100) | 0);

      var securityDepositPerTripDouble = Number(dataToSave.securityDeposit.replace(/[^0-9.]+/g, ""));
      const securityDepositPerTripInUsdCents = BigInt((securityDepositPerTripDouble * 100) | 0);

      var fuelPricePerGalDouble = Number(dataToSave.fuelPricePerGal.replace(/[^0-9.]+/g, ""));
      const fuelPricePerGalInUsdCents = BigInt((fuelPricePerGalDouble * 100) | 0);

      var locationLatitudeDouble = Number(dataToSave.locationLatitude.replace(/[^0-9.]+/g, ""));
      const locationLatitudeInPPM = BigInt((locationLatitudeDouble * 1_000_000) | 0);
      var locationLongitudeDouble = Number(dataToSave.locationLongitude.replace(/[^0-9.]+/g, ""));
      const locationLongitudeInPPM = BigInt((locationLongitudeDouble * 1_000_000) | 0);

      const request: ContractCreateCarRequest = {
        tokenUri: metadataURL,
        carVinNumber: dataToSave.vinNumber,
        brand: dataToSave.brand,
        model: dataToSave.model,
        yearOfProduction: dataToSave.releaseYear,
        pricePerDayInUsdCents: pricePerDayInUsdCents,
        securityDepositPerTripInUsdCents: securityDepositPerTripInUsdCents,
        tankVolumeInGal: BigInt(dataToSave.tankVolumeInGal),
        fuelPricePerGalInUsdCents: fuelPricePerGalInUsdCents,
        milesIncludedPerDay: BigInt(dataToSave.milesIncludedPerDay),
        country: dataToSave.country,
        state: dataToSave.state,
        city: dataToSave.city,
        locationLatitudeInPPM: locationLatitudeInPPM,
        locationLongitudeInPPM: locationLongitudeInPPM,
      };

      let transaction = await rentalityInfo.rentalityContract.addCar(request);

      const result = await transaction.wait();
      setCarInfoFormParams(emptyNewCarInfo);
      setDataSaved(true);
      return true;
    } catch (e) {
      console.error("Upload error" + e);
      setDataSaved(true);
      return false;
    }
  };

  return [carInfoFormParams, setCarInfoFormParams, dataSaved, saveCar] as const;
};

export default useAddCar;
