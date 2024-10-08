import { memo } from "react";
import { TripInfo } from "@/model/TripInfo";
import CarPhotoWithStatus from "./carPhotoWithStatus";
import СarDetailsForDetails from "./carDetailsForDetails";
import DateDetails from "./dateDetails";
import LocationDetails from "./locationDetails";
import { TFunction } from "i18next";
import TripRules from "./tripRules";

function TripCardForDetails({ tripInfo, isHost, t }: { tripInfo: TripInfo; isHost: boolean; t: TFunction }) {
  return (
    <div className="rnt-card flex flex-col overflow-hidden rounded-xl bg-rentality-bg">
      <div className="max-2xl:flex-wrap md:flex 2xl:flex-nowrap">
        <CarPhotoWithStatus carImageUrl={tripInfo.image} tripStatus={tripInfo.status} />

        <div id="trip-item-info" className="flex w-full flex-col md:flex-row">
          <СarDetailsForDetails tripInfo={tripInfo} isHost={isHost} t={t} />
          <DateDetails tripInfo={tripInfo} t={t} />
          <LocationDetails tripInfo={tripInfo} t={t} />
        </div>
        <TripRules tripInfo={tripInfo} t={t} />
      </div>
    </div>
  );
}

export default memo(TripCardForDetails);
