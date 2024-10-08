import { TFunction } from "@/utils/i18n";
import { memo } from "react";
import RntButton from "../common/rntButton";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { DeliveryPrices } from "@/hooks/host/useDeliveryPrices";

function SearchCarDeliveryExtraInfo({
  hostHomeLocation,
  deliveryPrices,
  isInsuranceIncluded,
  handleClose,
  t,
}: {
  hostHomeLocation: string;
  deliveryPrices: DeliveryPrices;
  isInsuranceIncluded: boolean;
  handleClose: () => void;
  t: TFunction;
}) {
  const t_comp: TFunction = (name, options) => {
    return t("search_car_delivery_extra_info." + name, options);
  };

  return (
    <div className="flex w-full flex-col">
      <h1 className="text-center text-xl text-rentality-secondary">{t_comp("title")}</h1>
      <section className="mt-4">
        <h2 className="text-lg text-rentality-secondary">{t_comp("host_home_location")}</h2>
        <address>{hostHomeLocation}</address>
        <p>{t_comp("free_pickup_and_return_location")}</p>
      </section>
      <section className="mt-4">
        <h2 className="text-lg text-rentality-secondary">{t_comp("delivery_fee_location")}</h2>
        <p>{t_comp("from_1_to_25_mile", { price: displayMoneyWith2Digits(deliveryPrices.from1To25milesPrice) })}</p>
        <p>{t_comp("over_25_mile", { price: displayMoneyWith2Digits(deliveryPrices.over25MilesPrice) })}</p>
      </section>
      {isInsuranceIncluded ? (
        <section className="mt-4">
          <h2 className="text-lg text-rentality-secondary">{t_comp("insurance_included_title")}</h2>
          <p>{t_comp("insurance_included_text")}</p>
        </section>
      ) : null}

      <RntButton className="mt-12 place-self-center" onClick={handleClose}>
        Got it
      </RntButton>
    </div>
  );
}

export default memo(SearchCarDeliveryExtraInfo);
