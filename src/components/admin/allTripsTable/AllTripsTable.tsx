import Link from "next/link";
import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import RntButton from "@/components/common/rntButton";
import { getTripStatusTextFromStatus } from "@/model/TripInfo";
import { TFunction } from "@/utils/i18n";
import { displayMoneyWith2DigitsOrNa } from "@/utils/numericFormatters";
import { TripStatus } from "@/model/blockchain/schemas";
import { usePathname } from "next/navigation";
import { cn } from "@/utils";
import { AdminTripDetails, PaymentStatus } from "@/hooks/admin/useAdminAllTrips";
import { useTranslation } from "react-i18next";

function getBgColorForTripStatus(tripStatus: TripStatus) {
  switch (tripStatus) {
    case TripStatus.Closed:
      return "bg-[#9148C8]";
    case TripStatus.CompletedWithoutGuestComfirmation:
      return "bg-[#C65911]";
    case TripStatus.Closed:
    case TripStatus.ClosedByAdminAfterCompleteWithoutGuestComfirmation:
    case TripStatus.ClosedByGuestAfterCompleteWithoutGuestComfirmation:
      return "bg-[#0070C0]";
    case TripStatus.Rejected:
    case TripStatus.HostRejected:
    case TripStatus.GuestRejected:
    case TripStatus.HostCanceled:
    case TripStatus.GuestCanceled:
      return "bg-[#FF0000]";
    default:
      return "";
  }
}

function getTextColorForPaymentStatus(paymentStatus: PaymentStatus) {
  switch (paymentStatus) {
    case "Unpaid":
      return "text-[#FF0000]";
    case "Refund to guest":
      return "text-[#FFFF00]";
    case "Paid to host":
      return "text-[#00B050]";
    case "Prepayment":
    default:
      return "text-[#9148C8]";
  }
}

type AllTripsTableProps = {
  data: AdminTripDetails[];
};

export default function AllTripsTable({ data }: AllTripsTableProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const t_att: TFunction = (name, options) => {
    return t("all_trips_table." + name, options);
  };

  const handlePayToHost = async () => {};
  const handleRefundToGuest = async () => {};

  const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12 text-center";

  return (
    <div className="mt-5 min-h-[300px] rounded-2xl bg-rentality-bg p-4 pb-16">
      <div className="text-xl lg:hidden">The resolution is too low!</div>
      <div className="bg-[#0070C0] bg-[#9148C8] bg-[#C65911] bg-[#FF0000] text-[#00B050] text-[#9148C8] text-[#FF0000] text-[#FFFF00]"></div>
      <table className="hidden w-full table-auto border-spacing-2 overflow-x-auto lg:block">
        <thead className="mb-2">
          <tr className="border-b-[2px] border-b-gray-500">
            <th className={`${headerSpanClassName} min-w-[5ch]`}>{t_att("tripId")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("vehicle")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("plateNumber")}</th>
            <th className={`${headerSpanClassName} min-w-[25ch]`}>{t_att("tripStatus")}</th>
            <th className={`${headerSpanClassName}`}>{t_att("paymentManagement")}</th>
            <th className={`${headerSpanClassName} min-w-[17ch]`}>{t_att("paymentsStatus")}</th>
            <th className={`${headerSpanClassName} min-w-[18ch]`}>{t_att("location")}</th>
            <th className={`${headerSpanClassName} min-w-[18ch]`}>{t_att("start")}</th>
            <th className={`${headerSpanClassName} min-w-[18ch]`}>{t_att("end")}</th>
            <th className={`${headerSpanClassName}`}>{t_att("days")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("host")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("guest")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("tripPriceBeforeDiscount")}</th>
            <th className={`${headerSpanClassName} min-w-[12ch]`}>{t_att("discountAmount")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("tripPriceAfterDiscount")}</th>
            <th className={`${headerSpanClassName} min-w-[16ch]`}>{t_att("deliveryFeePickUp")}</th>
            <th className={`${headerSpanClassName} min-w-[16ch]`}>{t_att("deliveryFeeDropOff")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("salesTax")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("governmentTax")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("totalChargeForTrip")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("refundForTrip")}</th>
            <th className={`${headerSpanClassName} min-w-[12ch]`}>{t_att("depositReceived")}</th>
            <th className={`${headerSpanClassName} min-w-[12ch]`}>{t_att("depositReturned")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("reimbursement")}</th>
            <th className={`${headerSpanClassName} min-w-[12ch]`}>{t_att("hostEarnings")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("platformCommission")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("details")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("accruableSalesTax")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("accruableGovernmentTax")}</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.map((tripItem) => {
            const detailsLink = `/guest/trips/tripInfo/${tripItem.tripId}?back=${pathname}`;
            const tripStatusBgColor = getBgColorForTripStatus(tripItem.tripStatus);
            const paymentStatusTextColor = getTextColorForPaymentStatus(tripItem.paymentsStatus);

            return (
              <tr key={tripItem.tripId} className="border-b-[2px] border-b-gray-500">
                <td className={rowSpanClassName}>{tripItem.tripId}</td>
                <td className={rowSpanClassName}>{tripItem.carDescription}</td>
                <td className={rowSpanClassName}>{tripItem.plateNumber}</td>
                <td className={cn(rowSpanClassName, tripStatusBgColor, "font-semibold")}>
                  {getTripStatusTextFromStatus(tripItem.tripStatus)}
                </td>
                <td className={rowSpanClassName}>
                  {tripItem.paymentsStatus === "Unpaid" && (
                    <div className="flex flex-col gap-2 py-2">
                      <RntButton className="h-8 w-40 bg-[#548235]" type="button" onClick={handlePayToHost}>
                        {t_att("pay_to_host")}
                      </RntButton>
                      <RntButton className="h-8 w-40 bg-[#C55A11]" type="button" onClick={handleRefundToGuest}>
                        {t_att("refund_to_guest")}
                      </RntButton>
                    </div>
                  )}
                </td>
                <td className={cn(rowSpanClassName, paymentStatusTextColor, "font-semibold")}>
                  {tripItem.paymentsStatus}
                </td>
                <td className={rowSpanClassName}>{tripItem.hostLocation}</td>
                <td className={rowSpanClassName}>
                  {dateFormatShortMonthDateTime(tripItem.tripStartDate, tripItem.timeZoneId)}
                </td>
                <td className={rowSpanClassName}>
                  {dateFormatShortMonthDateTime(tripItem.tripEndDate, tripItem.timeZoneId)}
                </td>
                <td className={rowSpanClassName}>{tripItem.tripDays}</td>
                <td className={rowSpanClassName}>{tripItem.hostName}</td>
                <td className={rowSpanClassName}>{tripItem.guestName}</td>
                <td className={rowSpanClassName}>
                  ${displayMoneyWith2DigitsOrNa(tripItem.tripPriceBeforeDiscountInUsd)}
                </td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.tripDiscountInUsd)}</td>
                <td className={rowSpanClassName}>
                  {displayMoneyWith2DigitsOrNa(tripItem.tripPriceAfterDiscountInUsd)}
                </td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.deliveryFeePickUpInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.deliveryFeeDropOffInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.salesTaxInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.governmentTaxInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.totalChargeForTripInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.refundForTripInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.depositReceivedInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.depositReturnedInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.reimbursementInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.hostEarningsInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.platformCommissionInUsd)}</td>
                <td className={rowSpanClassName}>
                  <Link href={detailsLink}>
                    <span className="text-rentality-secondary">{t_att("details")}</span>
                  </Link>
                </td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.accruableSalesTaxInUsd)}</td>
                <td className={rowSpanClassName}>
                  {displayMoneyWith2DigitsOrNa(tripItem.accruableGovernmentTaxInUsd)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}