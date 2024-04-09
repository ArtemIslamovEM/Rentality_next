import CarSearchItem from "@/components/guest/carSearchItem";
import useSearchCars, { SortOptionKey } from "@/hooks/guest/useSearchCars";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { dateToHtmlDateTimeFormat } from "@/utils/datetimeFormatters";
import { calculateDays } from "@/utils/date";
import SlidingPanel from "react-sliding-side-panel";
import { SearchCarRequest, emptySearchCarRequest } from "@/model/SearchCarRequest";
import { SearchCarInfo } from "@/model/SearchCarsResult";
import RntInput from "@/components/common/rntInput";
import RntButton from "@/components/common/rntButton";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { useUserInfo } from "@/contexts/userInfoContext";
import { isEmpty } from "@/utils/string";
import RntSelect from "@/components/common/rntSelect";
import moment from "moment";
import { usePrivy } from "@privy-io/react-auth";
import { DialogActions } from "@/utils/dialogActions";
import Layout from "@/components/layout/layout";
import { GoogleMapsProvider } from "@/contexts/googleMapsContext";
import CarSearchMap from "@/components/guest/carMap/carSearchMap";
import RntPlaceAutocomplete from "@/components/common/rntPlaceAutocomplete";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/pages/i18n";

export default function Search() {
  const dateNow = new Date();
  const defaultDateFrom = new Date(dateNow.getTime() + 1 * 60 * 60 * 1000); //dateNow + 1 hour
  const defaultDateTo = new Date(dateNow.getTime() + 25 * 60 * 60 * 1000); //dateNow + 1 day and 1 hour
  const customEmptySearchCarRequest: SearchCarRequest = {
    ...emptySearchCarRequest,
    city: "Miami",
    dateFrom: dateToHtmlDateTimeFormat(defaultDateFrom),
    dateTo: dateToHtmlDateTimeFormat(defaultDateTo),
  };
  const { t } = useTranslation();
  const sortOption: object = t("search_page.sort_options", {
    returnObjects: true,
  });
  
  function isSortOptionKey(key: PropertyKey): key is SortOptionKey {
    return sortOption.hasOwnProperty(key);
  }

  const t_page: TFunction = (path, options) => {
    return t("search_page." + path, options);
  };
  
  const [isLoading, searchAvailableCars, searchResult, sortSearchResult, createTripRequest, setSearchResult] =
    useSearchCars();
  const [searchCarRequest, setSearchCarRequest] = useState<SearchCarRequest>(customEmptySearchCarRequest);
  const [requestSending, setRequestSending] = useState<boolean>(false);
  const [openFilterPanel, setOpenFilterPanel] = useState(false);
  const [searchButtonDisabled, setSearchButtonDisabled] = useState<boolean>(false);
  const { showInfo, showError, showDialog, hideDialogs } = useRntDialogs();
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);

  const userInfo = useUserInfo();
  const router = useRouter();
  const { authenticated, login } = usePrivy();

  const handleSearchClick = async () => {
    const result = await searchAvailableCars(searchCarRequest);
    if (result) {
      setSortBy(undefined);
    }
  };

  const handleRentCarRequest = async (carInfo: SearchCarInfo) => {
    if (!authenticated) {
      const action = (
        <>
          {DialogActions.Button(t("common.info.login"), () => {
            hideDialogs();
            login();
          })}
          {DialogActions.Cancel(hideDialogs)}
        </>
      );
      showDialog(t("common.info.connect_wallet"), action);
      return;
    }
	
    try {
      if (isEmpty(userInfo?.drivingLicense)) {
        showError(t_er("user_info"));
        await router.push("/guest/profile");
        return;
      }

      if (searchResult.searchCarRequest.dateFrom == null) {
        showError(t_er("date_from"));
        return;
      }
      if (searchResult.searchCarRequest.dateTo == null) {
        showError(t_er("date_to"));
        return;
      }
      const startDateTime = moment.utc(searchResult.searchCarRequest.dateFrom).toDate();
      const endDateTime = moment.utc(searchResult.searchCarRequest.dateTo).toDate();

      const days = calculateDays(startDateTime, endDateTime);
      if (days < 0) {
        showError(t_er("date_eq"));
        return;
      }
      setRequestSending(true);

      const totalPriceInUsdCents = carInfo.pricePerDay * 100 * days;
      const depositInUsdCents = carInfo.securityDeposit * 100;
      const location = `${searchResult.searchCarRequest.city}, ${searchResult.searchCarRequest.state}, ${searchResult.searchCarRequest.country}`;

      showInfo(t("common.info.sign"));
      const result = await createTripRequest(
        carInfo.carId,
        carInfo.ownerAddress,
        startDateTime,
        endDateTime,
        searchResult.searchCarRequest.utcOffsetMinutes,
        location,
        location,
        totalPriceInUsdCents,
        0,
        depositInUsdCents
      );

      setRequestSending(false);
      hideDialogs();
      if (!result) {
        showError(t_er("request"));
        return;
      }
      router.push("/guest/trips");
    } catch (e) {
      showError(t_er("request"));
      console.error("sendRentCarRequest error:" + e);

      setRequestSending(false);
    }
  };

  const handleMapClick = async (carID: Number) => {
    const newSearchCarInfo = { ...searchResult };
    newSearchCarInfo.carInfos.forEach((item: SearchCarInfo) => {
      if (item.carId == carID) {
        item.highlighted = !item.highlighted;
      } else {
        item.highlighted = false;
      }
    });

    setSearchResult(newSearchCarInfo);
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

  useEffect(() => {
    const isDataValid =
      formatLocation?.length > 0 &&
      new Date(searchCarRequest.dateFrom) >= new Date() &&
      new Date(searchCarRequest.dateTo) > new Date(searchCarRequest.dateFrom);
    setSearchButtonDisabled(!isDataValid);
  }, [searchCarRequest]);

  useEffect(() => {
    if (sortBy === undefined) return;
    sortSearchResult(sortBy);
  }, [sortBy, sortSearchResult]);
  const t_el = (element: string) => {
    return t_page("elements." + element);
  };
  const t_f: TFunction = (filter, options) => {
    return t_page("filters." + filter, options);
  };

  return (
    <GoogleMapsProvider libraries={["maps", "marker", "places"]}>
      <Layout>
        <div className="flex flex-col" title="Search">
          <div className="search my-2 flex max-xl:flex-col gap-2 xl:items-end">
            {/* <RntInput
            className="xl:w-1/2"
            id="location"
            label="Pick up & Return Location"
            value={formatLocation(
              searchCarRequest.city,
              searchCarRequest.state,
              searchCarRequest.country
            )}
            onChange={handleSearchInputChange}
          /> */}
            <RntPlaceAutocomplete
              className="xl:w-1/2"
              id="location"
              label={t_el("location_label")}
              placeholder={t_el("location_placeholder")}
              initValue={formatLocation(searchCarRequest.city, searchCarRequest.state, searchCarRequest.country)}
              onChange={handleSearchInputChange}
              onAddressChange={(placeDetails) => {
                const country = placeDetails.country?.short_name ?? "";
                const state = placeDetails.state?.long_name ?? "";
                const city = placeDetails.city?.long_name ?? "";

                setSearchCarRequest({
                  ...searchCarRequest,
                  country: country,
                  state: state,
                  city: city,
                  utcOffsetMinutes: placeDetails.utcOffsetMinutes,
                });
              }}
            />
            <div className="flex max-md:flex-col md:items-end md:justify-between xl:justify-around w-full">
              <RntInput
                className="md:w-1/3 2xl:w-[38%]"
                id="dateFrom"
                label={t("common.from")}
                type="datetime-local"
                value={searchCarRequest.dateFrom}
                onChange={handleSearchInputChange}
              />
              <RntInput
                className="md:w-1/3 2xl:w-[38%]"
                id="dateTo"
                label={t("common.to")}
                type="datetime-local"
                value={searchCarRequest.dateTo}
                onChange={handleSearchInputChange}
              />

              <RntButton
                className="w-full sm:w-40 max-xl:mt-4"
                disabled={searchButtonDisabled}
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
          <div className="mb-8 flex flex-row"></div>
          {isLoading ? (
            <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
          ) : (
            <>
              <div className="text-l font-bold">
                {searchResult?.carInfos?.length ?? 0} {t_page("info.cars_available")}
              </div>
              <div className="grid grid-cols-2">
                <div className="my-4 grid grid-cols-1 gap-4">
                  {searchResult?.carInfos?.length > 0 ? (
                    searchResult?.carInfos
                      .sort((a: SearchCarInfo, b: SearchCarInfo) => {
                        if (a.highlighted && !b.highlighted) {
                          return -1;
                        } else if (!a.highlighted && b.highlighted) {
                          return 1;
                        } else {
                          return 0;
                        }
                      })
                      .map((value: SearchCarInfo) => {
                        return (
                          <CarSearchItem
                            key={value.carId}
                            searchInfo={value}
                            handleRentCarRequest={handleRentCarRequest}
                            disableButton={requestSending}
                            t={t_page}
                          />
                        );
                      })
                  ) : (
                    <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
                      {t_page("info.no_cars")}
                    </div>
                  )}
                </div>
                <CarSearchMap
                  carInfos={searchResult?.carInfos}
                  width="100%"
                  height="100vh"
                  onMarkerClick={handleMapClick}
                />
              </div>
            </>
          )}
        </div>
        <div className="sliding-panel-container w-full fixed top-0 left-0">
          <SlidingPanel
            type={"left"}
            isOpen={openFilterPanel}
            size={50}
            noBackdrop={false}
            backdropClicked={() => setOpenFilterPanel(false)}
            panelContainerClassName="sliding-panel"
          >
            <div className="flex flex-col py-8">
              <div className="self-end mr-8">
                <i className="fi fi-br-cross" onClick={() => setOpenFilterPanel(false)}></i>
              </div>
              <div className="flex flex-col gap-2 sm:gap-4 px-2 sm:px-4 md:px-8 lg:px-16 mt-4">
                <RntInput
                  id="filter-brand"
                  label={t_f("brand")}
                  value={searchCarRequest.brand}
                  onChange={(e) =>
                    setSearchCarRequest({
                      ...searchCarRequest,
                      brand: e.target.value,
                    })
                  }
                />
                <RntInput
                  id="filter-model"
                  label={t_f("model")}
                  value={searchCarRequest.model}
                  onChange={(e) =>
                    setSearchCarRequest({
                      ...searchCarRequest,
                      model: e.target.value,
                    })
                  }
                />
                <RntInput
                  id="filter-year-from"
                  label={t_f("year_from")}
                  value={searchCarRequest.yearOfProductionFrom}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (isNaN(Number(newValue)) && newValue !== "") return;

                    setSearchCarRequest({
                      ...searchCarRequest,
                      yearOfProductionFrom: newValue,
                    });
                  }}
                />
                <RntInput
                  id="filter-year-yo"
                  label={t_f("year_to")}
                  value={searchCarRequest.yearOfProductionTo}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (isNaN(Number(newValue)) && newValue !== "") return;

                    setSearchCarRequest({
                      ...searchCarRequest,
                      yearOfProductionTo: newValue,
                    });
                  }}
                />
                <RntInput
                  id="filter-price-from"
                  label={t_f("price_from")}
                  value={searchCarRequest.pricePerDayInUsdFrom}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (isNaN(Number(newValue)) && newValue !== "") return;
                    setSearchCarRequest({
                      ...searchCarRequest,
                      pricePerDayInUsdFrom: newValue,
                    });
                  }}
                />
                <RntInput
                  id="filter-price-yo"
                  label={t_f("price_to")}
                  value={searchCarRequest.pricePerDayInUsdTo}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (isNaN(Number(newValue)) && newValue !== "") return;

                    setSearchCarRequest({
                      ...searchCarRequest,
                      pricePerDayInUsdTo: newValue,
                    });
                  }}
                />
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 max-sm:mt-2 sm:justify-between">
                  <RntButton
                    className="max-sm:h-10 max-sm:w-full"
                    onClick={() => {
                      setOpenFilterPanel(false);
                      handleSearchClick();
                    }}
                  >
                    {t_el("button_apply")}
                  </RntButton>
                  <RntButton
                    className="max-sm:h-10 max-sm:w-full"
                    onClick={() => setSearchCarRequest(customEmptySearchCarRequest)}
                  >
                    {t_el("button_reset")}
                  </RntButton>
                </div>
              </div>
            </div>
          </SlidingPanel>
        </div>
      </Layout>
    </GoogleMapsProvider>
  );
}
