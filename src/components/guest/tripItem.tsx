import Head from "next/head";
import Image from "next/image";
import logo from "../../images/logo.png";
import Link from "next/link";
import { dateFormat } from "@/utils/datetimeFormatters";
import { TripInfo, getTripStatusTextFromStatus } from "@/model/TripInfo";

type Props = {
  tripInfo: TripInfo;
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<void>;
};

export default function TripItem({ tripInfo, changeStatusCallback }: Props) {
  return (
    <div className="flex flex-wrap rounded-xl bg-pink-100">
      <div className="relative h-56 w-60 flex-shrink-0 rounded-l-xl bg-slate-400 text-center">
        <Image src={tripInfo.image} alt="" width={1000} height={1000} className="h-full w-full rounded-lg object-cover" />
        {/* <img
          src={tripInfo.image}
          alt=""
          className="h-full w-full rounded-lg object-cover"
        /> */}
        <div className="absolute right-0 top-2 px-8 py-2 text-gray-100 bg-gray-600 rounded-l-3xl">
          <strong className="text-m">{`${getTripStatusTextFromStatus(tripInfo.status)}`}</strong>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2 p-4">
        <div className="flex flex-col">
          <div>
            <strong className="text-xl">{`${tripInfo.brand} ${tripInfo.model} ${tripInfo.year}`}</strong>
          </div>
          <div>{tripInfo.licensePlate}</div>
        </div>
        <div className="flex flex-row gap-4">
          {tripInfo.allowedActions.map((action) => {
            return (
              <button
                key={action.text}
                className="h-16 w-full rounded-md bg-violet-700 px-4"
                onClick={() => {
                  changeStatusCallback(() => {
                    return action.action(tripInfo.tripId);
                  });
                }}
              >
                {action.text}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-col">
          <div>
            <strong className="text-l">Trip start</strong>
          </div>
          <div className="whitespace-nowrap">
            {dateFormat(tripInfo.tripStart)}
          </div>
          {/* <div>April 05, 4:00 AM</div> */}
        </div>
        <div className="flex flex-col">
          <div>
            <strong className="text-l">Trip end</strong>
          </div>
          <div className="whitespace-nowrap">
            {dateFormat(tripInfo.tripEnd)}
          </div>
          {/* <div>April 05, 4:00 AM</div> */}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-col">
          <div>
            <strong className="text-l whitespace-nowrap">
              Pickup location
            </strong>
          </div>
          <div>{tripInfo.locationStart}</div>
          {/* <div>Miami, CA, USA</div> */}
        </div>
        <div className="flex flex-col">
          <div>
            <strong className="text-l whitespace-nowrap">
              Return location
            </strong>
          </div>
          <div>{tripInfo.locationEnd}</div>
          {/* <div>Miami, CA, USA</div> */}
        </div>
      </div>
    </div>
  );
}