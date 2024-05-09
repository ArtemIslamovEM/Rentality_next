import { isEmpty } from "@/utils/string";
import RntButton from "../common/rntButton";
import RntInput from "../common/rntInput";
import RntPlaceAutoComplete from "../common/rntPlaceAutocomplete";
import RntSelect from "../common/rntSelect";
import { SortOptionKey } from "@/hooks/guest/useSearchCars";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { TFunction as TFunctionNext } from "i18next";
import { TFunction } from "@/utils/i18n";
import { useEffect, useState } from "react";
import { ParseLocationResponse } from "@/pages/api/parseLocation";
import moment from "moment";

function formatLocation(city: string, state: string, country: string) {
  city = city != null && city.length > 0 ? city + ", " : "";
  state = state != null && state.length > 0 ? state + ", " : "";
  country = country != null && country.length > 0 ? country + ", " : "";
  const location = `${city}${state}${country}`;
  if (location.length > 2) {
    return location.slice(0, -2);
  }

  return location;
}

export default function SearchAndFilters({
  searchCarRequest,
  setSearchCarRequest,
  sortBy,
  setSortBy,
  handleSearchClick,
  setOpenFilterPanel,
  t,
}: {
  searchCarRequest: SearchCarRequest;
  setSearchCarRequest: (value: SearchCarRequest) => void;
  sortBy: string | undefined;
  setSortBy: (value: string | undefined) => void;
  handleSearchClick: () => Promise<void>;
  setOpenFilterPanel: (value: boolean) => void;
  t: TFunctionNext;
}) {
  const [utcOffset, setUtcOffset] = useState("");

  const gmtLabel = isEmpty(utcOffset) ? "" : `(GMT${utcOffset})`;
  const isSearchAllowed =
    formatLocation(searchCarRequest.city, searchCarRequest.state, searchCarRequest.country).length > 0 &&
    new Date(searchCarRequest.dateFrom) >= new Date() &&
    new Date(searchCarRequest.dateTo) > new Date(searchCarRequest.dateFrom);

  const sortOption: object = t("search_page.sort_options", {
    returnObjects: true,
  });

  function isSortOptionKey(key: PropertyKey): key is SortOptionKey {
    return sortOption.hasOwnProperty(key);
  }

  const t_page: TFunction = (path, options) => {
    return t("search_page." + path, options);
  };

  const t_el = (element: string) => {
    return t_page("elements." + element);
  };

  function handleSearchInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const name = e.target.name;

    if (name === "location") {
      return;
    }

    setSearchCarRequest({
      ...searchCarRequest,
      [name]: value,
    });
  }

  useEffect(() => {
    const getGMTFromLocation = async () => {
      const address = formatLocation(searchCarRequest.city, searchCarRequest.state, searchCarRequest.country);
      if (isEmpty(address)) {
        setUtcOffset("");
        return;
      }

      var url = new URL(`/api/parseLocation`, window.location.origin);
      url.searchParams.append("address", address);
      const apiResponse = await fetch(url);

      if (!apiResponse.ok) {
        setUtcOffset("");
        return;
      }
      const apiJson = (await apiResponse.json()) as ParseLocationResponse;
      if ("error" in apiJson) {
        setUtcOffset("");
        return;
      }

      setUtcOffset(moment.tz(apiJson.timeZoneId).format("Z").slice(0, 3));
    };

    getGMTFromLocation();
  }, [searchCarRequest.city, searchCarRequest.state, searchCarRequest.country]);

  return (
    <>
      <div className="search my-2 flex max-xl:flex-col gap-2 xl:items-end">
        <RntPlaceAutoComplete
          className="xl:w-1/2"
          id="location"
          label={t_el("location_label")}
          placeholder={t_el("location_placeholder")}
          includeStreetAddress={true}
          initValue={formatLocation(searchCarRequest.city, searchCarRequest.state, searchCarRequest.country)}
          onChange={handleSearchInputChange}
          onAddressChange={async (placeDetails) => {
            const country = placeDetails.country?.short_name ?? "";
            const state = placeDetails.state?.long_name ?? "";
            const city = placeDetails.city?.long_name ?? "";

            setSearchCarRequest({
              ...searchCarRequest,
              country: country,
              state: state,
              city: city,
            });
          }}
        />
        <div className="flex max-md:flex-col md:items-end md:justify-between xl:justify-around w-full">
          <RntInput
            className="md:w-1/3 2xl:w-[38%]"
            id="dateFrom"
            label={`${t("common.from")} ${gmtLabel}`}
            type="datetime-local"
            value={searchCarRequest.dateFrom}
            onChange={handleSearchInputChange}
          />
          <RntInput
            className="md:w-1/3 2xl:w-[38%]"
            id="dateTo"
            label={`${t("common.to")} ${gmtLabel}`}
            type="datetime-local"
            value={searchCarRequest.dateTo}
            onChange={handleSearchInputChange}
          />
          <RntButton
            className="w-full sm:w-40 max-xl:mt-4"
            disabled={!isSearchAllowed}
            onClick={
              () => handleSearchClick()
              // showError("w-full sm:w-40 max-xl:mt-4")
            }
          >
            {t("common.search")}
          </RntButton>
        </div>
      </div>
      <div className="mt-2 flex flex-row gap-2 max-sm:justify-between">
        <RntButton className="w-40 " onClick={() => setOpenFilterPanel(true)}>
          {t_el("button_filter")}
        </RntButton>
        <RntSelect
          className="w-40"
          id="sort"
          readOnly={false}
          value={sortBy ?? ""}
          onChange={(e) => {
            const newValue = e.target.value;
            if (isSortOptionKey(newValue)) {
              setSortBy(newValue);
            }
          }}
        >
          <option className="hidden" value={""} disabled>
            {t_el("sort_by")}
          </option>
          {Object.entries(sortOption ?? {}).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </RntSelect>
      </div>
    </>
  );
}