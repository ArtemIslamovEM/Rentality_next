import { useEffect, useRef, useState } from "react";
import { getTripStatusFromContract } from "@/model/blockchain/ContractTrip";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractChatInfo } from "@/model/blockchain/ContractChatInfo";
import { useRentality } from "@/contexts/rentalityContext";
import { ChatInfo } from "@/model/ChatInfo";
import { NotificationInfo } from "@/model/NotificationInfo";

const useNotificationInfos = (isHost: boolean) => {
  const rentalityInfo = useRentality();
  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [notificationInfos, setNotificationInfos] = useState<NotificationInfo[]>([
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
  ]);

  const getChatInfos = async (rentalityContract: IRentalityContract) => {
    try {
      if (rentalityContract == null) {
        console.error("getChatInfos error: contract is null");
        return;
      }
      const chatInfosView: ContractChatInfo[] = isHost
        ? await rentalityContract.getChatInfoForHost()
        : await rentalityContract.getChatInfoForGuest();

      const chatInfosData =
        chatInfosView.length === 0
          ? []
          : await Promise.all(
              chatInfosView.map(async (ci: ContractChatInfo, index) => {
                const meta = await getMetaDataFromIpfs(ci.carMetadataUrl);
                const tripStatus = getTripStatusFromContract(Number(ci.tripStatus));

                let item: ChatInfo = {
                  tripId: Number(ci.tripId),

                  guestAddress: ci.guestAddress,
                  guestName: ci.guestName,
                  guestPhotoUrl: getIpfsURIfromPinata(ci.guestPhotoUrl),

                  hostAddress: ci.hostAddress,
                  hostName: ci.hostName,
                  hostPhotoUrl: getIpfsURIfromPinata(ci.hostPhotoUrl),

                  tripTitle: `${tripStatus} trip with ${ci.hostName} ${ci.carBrand} ${ci.carModel}`,
                  lastMessage: "Click to open chat",

                  carPhotoUrl: getIpfsURIfromPinata(meta.image),
                  tripStatus: tripStatus,
                  carTitle: `${ci.carBrand} ${ci.carModel} ${ci.carYearOfProduction}`,
                  carLicenceNumber: meta.attributes?.find((x: any) => x.trait_type === "License plate")?.value ?? "",

                  messages: [],
                };
                return item;
              })
            );

      return chatInfosData;
    } catch (e) {
      console.error("getChatInfos error:" + e);
    }
  };

  const isInitiating = useRef(false);

  useEffect(() => {
    // const initChat = async () => {
    //   if (!rentalityInfo) return;
    //   if (isInitiating.current) return;
    //   isInitiating.current = true;
    //   const contractInfo = rentalityInfo.rentalityContract;
    //   if (contractInfo === undefined) {
    //     console.error("chat contract info is undefined");
    //     return;
    //   }
    //   console.log("initting chat....");
    //   setDataFetched(false);
    //   try {
    //     setChatClient(client);
    //     setChatInfos(infos);
    //   } catch (e) {
    //     console.error("getChatHelper error:" + e);
    //   } finally {
    //     setDataFetched(true);
    //   }
    //   isInitiating.current = false;
    // };
    // initChat();

    setDataFetched(true);
  }, [rentalityInfo]);

  return [dataFetched, notificationInfos] as const;
};

export default useNotificationInfos;
