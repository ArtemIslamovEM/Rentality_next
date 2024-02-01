import { dateFormatDayMonthTime } from "@/utils/datetimeFormatters";
import Link from "next/link";
import RntButton from "../common/rntButton";
import { twMerge } from "tailwind-merge";
import { getStringFromMoneyInCents } from "@/utils/formInput";
import { Claim, ClaimStatus } from "@/model/Claim";

type Props =
  | {
      isHost: true;
      claims: Claim[];
      cancelClaim: (claimId: number) => Promise<void>;
    }
  | {
      isHost: false;
      claims: Claim[];
      payClaim: (claimId: number) => Promise<void>;
    };

export default function ClaimHistory(props: Props) {
  const { isHost, claims } = props;
  const headerSpanClassName = "text-start px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12";
  const redTextClassName = twMerge(rowSpanClassName, "text-red-400");

  return (
    <div className="w-full bg-rentality-bg p-4 rounded-2xl mt-5">
      <h3 className="text-xl mb-4">Claims history</h3>
      <table className="w-full table-auto border-spacing-2">
        <thead className="mb-2">
          <tr className="text-rentality-additional-light ">
            <th className={headerSpanClassName}>Invoice type</th>
            <th className={headerSpanClassName}>Payment deadline</th>
            <th className={headerSpanClassName}>Reservation</th>
            <th className={headerSpanClassName}>Car</th>
            <th className={headerSpanClassName}>Describe</th>
            <th className={headerSpanClassName}>Amount $</th>
            <th className={headerSpanClassName}>Status</th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {claims.map((claim) => {
            const chatLink = `/${isHost ? "host" : "guest"}/messages?tridId=${claim.tripId}`;
            const telLink = `tel:${isHost ? claim.guestPhoneNumber : claim.hostPhoneNumber}`;
            const detailsLink = `/${isHost ? "host" : "guest"}/trips/tripInfo/${claim.tripId}`;

            return (
              <tr key={claim.claimId} className="border-b-[1px] border-b-gray-500">
                <td className={rowSpanClassName}>{claim.claimTypeText}</td>
                <td className={claim.deadlineDate <= new Date() ? redTextClassName : rowSpanClassName}>
                  {dateFormatDayMonthTime(claim.deadlineDate)}
                </td>
                <td className={rowSpanClassName}>{claim.tripId}</td>
                <td className={rowSpanClassName}>{claim.carInfo}</td>
                <td className={rowSpanClassName}>{claim.description}</td>
                <td className={rowSpanClassName}>${getStringFromMoneyInCents(claim.amountInUsdCents)}</td>
                <td className={claim.status === ClaimStatus.Overdue ? redTextClassName : rowSpanClassName}>
                  {claim.statusText}
                </td>
                <td className={rowSpanClassName}>
                  {claim.status === ClaimStatus.NotPaid || claim.status === ClaimStatus.Overdue ? (
                    isHost ? (
                      <RntButton
                        className="w-24 h-8"
                        onClick={() => {
                          props.cancelClaim(claim.claimId);
                        }}
                      >
                        Cancel
                      </RntButton>
                    ) : (
                      <RntButton
                        className="w-24 h-8"
                        onClick={() => {
                          props.payClaim(claim.claimId);
                        }}
                      >
                        Pay
                      </RntButton>
                    )
                  ) : null}
                </td>
                <td className={rowSpanClassName}>
                  <Link href={chatLink}>
                    <i className="fi fi-br-envelope pr-1"></i>
                  </Link>
                </td>
                <td className={rowSpanClassName}>
                  <a href={telLink}>
                    <i className="fi fi-br-phone-flip"></i>
                  </a>
                </td>
                <td className={rowSpanClassName}>
                  <Link href={detailsLink}>
                    <i className="fi fi-br-eye pr-1 text-rentality-secondary"></i>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}