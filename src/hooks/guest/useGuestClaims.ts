import { useEffect, useMemo, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { formatPhoneNumber, getDateFromBlockchainTime, getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { Claim, getClaimStatusTextFromStatus, getClaimTypeTextFromClaimType } from "@/model/Claim";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import {
  ContractCreateClaimRequest,
  ContractFullClaimInfo,
  ContractTripDTO,
  TripStatus,
} from "@/model/blockchain/schemas";
import { validateContractFullClaimInfo, validateContractTripDTO } from "@/model/blockchain/schemas_utils";
import { CreateClaimRequest, TripInfoForClaimCreation } from "@/model/CreateClaimRequest";
import encodeClaimChatMessage from "@/components/chat/utils";
import { useChat } from "@/contexts/chatContext";
import { uploadFileToIPFS } from "@/utils/pinata";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { dateRangeFormatShortMonthDateYear } from "@/utils/datetimeFormatters";

const useGuestClaims = () => {
  const rentalityContract = useRentality();
  const ethereumInfo = useEthereum();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [updateRequired, setUpdateRequired] = useState<Boolean>(true);
  const [claims, setClaims] = useState<Claim[]>([]);
  const chatContextInfo = useChat();
  const [tripInfos, setTripInfos] = useState<TripInfoForClaimCreation[]>([
    { tripId: 0, guestAddress: "", tripDescription: "Loading...", tripStart: new Date() },
  ]);

  const updateData = () => {
    setUpdateRequired(true);
  };

  const createClaim = async (createClaimRequest: CreateClaimRequest) => {
    if (rentalityContract === null) {
      console.error("createClaim: rentalityContract is null");
      return false;
    }

    try {
      const filesToSave = createClaimRequest.localFileUrls.filter((i) => i);
      const savedFiles: string[] = [];

      if (filesToSave.length > 0) {
        filesToSave.forEach(async (file) => {
          const response = await uploadFileToIPFS(file.file, "RentalityClaimFile", {
            createdAt: new Date().toISOString(),
            createdBy: ethereumInfo?.walletAddress ?? "",
            version: SMARTCONTRACT_VERSION,
            chainId: ethereumInfo?.chainId ?? 0,
          });

          if (!response.success || !response.pinataURL) {
            throw new Error("Uploaded image to Pinata error");
          }
          savedFiles.push(response.pinataURL);
        });
      }

      const claimRequest: ContractCreateClaimRequest = {
        tripId: BigInt(createClaimRequest.tripId),
        claimType: createClaimRequest.claimType,
        description: createClaimRequest.description,
        amountInUsdCents: BigInt(createClaimRequest.amountInUsdCents),
        photosUrl: savedFiles.join("|"),
      };

      const transaction = await rentalityContract.createClaim(claimRequest);
      await transaction.wait();

      const message = encodeClaimChatMessage(createClaimRequest);
      chatContextInfo.sendMessage(createClaimRequest.guestAddress, createClaimRequest.tripId, message);
      return true;
    } catch (e) {
      console.error("createClaim error:" + e);
      return false;
    }
  };

  const payClaim = async (claimId: number) => {
    if (!rentalityContract) {
      console.error("payClaim error: rentalityContract is null");
      return false;
    }

    try {
      const claimAmountInEth = claims.find((i) => i.claimId === claimId)?.amountInEth ?? 0;

      let transaction = await rentalityContract.payClaim(claimAmountInEth, BigInt(claimId), {
        value: claimAmountInEth,
      });

      await transaction.wait();
      return true;
    } catch (e) {
      console.error("payClaim error:" + e);
      return false;
    }
  };

  const cancelClaim = async (claimId: number) => {
    if (!rentalityContract) {
      console.error("cancelClaim error: rentalityContract is null");
      return false;
    }

    try {
      const transaction = await rentalityContract.rejectClaim(BigInt(claimId));
      await transaction.wait();
      return true;
    } catch (e) {
      console.error("cancelClaim error:" + e);
      return false;
    }
  };

  useEffect(() => {
    const getClaims = async (rentalityContract: IRentalityContract) => {
      try {
        if (rentalityContract == null) {
          console.error("getClaims error: contract is null");
          return;
        }
        const claimsView: ContractFullClaimInfo[] = await rentalityContract.getMyClaimsAsGuest();

        const claimsData =
          claimsView.length === 0
            ? []
            : await Promise.all(
                claimsView.map(async (i: ContractFullClaimInfo, index) => {
                  if (index === 0) {
                    validateContractFullClaimInfo(i);
                  }

                  let item: Claim = {
                    claimId: Number(i.claim.claimId),
                    tripId: Number(i.claim.tripId),
                    deadlineDate: getDateFromBlockchainTime(i.claim.deadlineDateInSec),
                    claimType: i.claim.claimType,
                    claimTypeText: getClaimTypeTextFromClaimType(i.claim.claimType),
                    status: i.claim.status,
                    statusText: getClaimStatusTextFromStatus(i.claim.status),
                    carInfo: `${i.carInfo.brand} ${i.carInfo.model} ${i.carInfo.yearOfProduction}`,
                    description: i.claim.description,
                    amountInUsdCents: Number(i.claim.amountInUsdCents),
                    amountInEth: i.amountInEth,
                    payDateInSec: Number(i.claim.payDateInSec),
                    rejectedBy: i.claim.rejectedBy,
                    rejectedDateInSec: Number(i.claim.rejectedDateInSec),
                    hostPhoneNumber: formatPhoneNumber(i.hostPhoneNumber),
                    guestPhoneNumber: formatPhoneNumber(i.guestPhoneNumber),
                    tripDays: 0,
                    isIncomingClaim: i.claim.isHostClaims,
                    fileUrls: i.claim.photosUrl.split("|").map((url) => getIpfsURIfromPinata(url)),
                    timeZoneId: i.timeZoneId,
                  };
                  return item;
                })
              );

        const guestTripsView: ContractTripDTO[] = (await rentalityContract.getTripsAsGuest()).filter(
          (i) => i.trip.status !== TripStatus.Pending && i.trip.status !== TripStatus.Rejected
        );

        const guestTripsData =
          guestTripsView.length === 0
            ? []
            : await Promise.all(
                guestTripsView.map(async (i: ContractTripDTO, index) => {
                  if (index === 0) {
                    validateContractTripDTO(i);
                  }

                  const meta = await getMetaDataFromIpfs(i.metadataURI);

                  const brand = i.brand ?? meta.attributes?.find((x: any) => x.trait_type === "Brand")?.value ?? "";
                  const model = i.model ?? meta.attributes?.find((x: any) => x.trait_type === "Model")?.value ?? "";
                  const year =
                    i.yearOfProduction?.toString() ??
                    meta.attributes?.find((x: any) => x.trait_type === "Release year")?.value ??
                    "";
                  const guestName = i.trip.guestName;
                  const tripStart = getDateFromBlockchainTimeWithTZ(i.trip.startDateTime, i.timeZoneId);
                  const tripEnd = getDateFromBlockchainTimeWithTZ(i.trip.endDateTime, i.timeZoneId);

                  let item: TripInfoForClaimCreation = {
                    tripId: Number(i.trip.tripId),
                    guestAddress: i.trip.guest,
                    tripDescription: `${brand} ${model} ${year} ${guestName} trip ${dateRangeFormatShortMonthDateYear(
                      tripStart,
                      tripEnd,
                      i.timeZoneId
                    )}`,
                    tripStart: tripStart,
                  };
                  return item;
                })
              );

        return { guestTripsData, claimsData };
      } catch (e) {
        console.error("getClaims error:" + e);
      }
    };

    if (!updateRequired) return;
    if (!rentalityContract) return;

    setUpdateRequired(false);
    setIsLoading(true);

    getClaims(rentalityContract)
      .then((data) => {
        setClaims(data?.claimsData ?? []);
        setTripInfos(data?.guestTripsData ?? []);
      })
      .finally(() => setIsLoading(false));
  }, [updateRequired, rentalityContract]);

  const sortedClaims = useMemo(() => {
    return [...claims].sort((a, b) => {
      return b.deadlineDate.getTime() - a.deadlineDate.getTime();
    });
  }, [claims]);

  const sortedTripInfos = useMemo(() => {
    return [...tripInfos].sort((a, b) => {
      return b.tripStart.getTime() - a.tripStart.getTime();
    });
  }, [tripInfos]);

  return {
    isLoading,
    claims: sortedClaims,
    tripInfos: sortedTripInfos,
    createClaim,
    payClaim,
    cancelClaim,
    updateData,
  } as const;
};

export default useGuestClaims;
