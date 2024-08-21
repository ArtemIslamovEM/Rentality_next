import SlidingPanel from "react-sliding-side-panel";
import RntInput from "../common/rntInput";
import RntButton from "../common/rntButton";
import { TFunction as TFunctionNext } from "i18next";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { Dispatch, useState } from "react";
import { useAppContext } from "@/contexts/appContext";
import RntCarMakeSelect from "@/components/common/rntCarMakeSelect";
import RntCarModelSelect from "@/components/common/rntCarModelSelect";
import RntCarYearSelect from "@/components/common/rntCarYearSelect";

export default function FilterSlidingPanel({
  searchCarRequest,
  setSearchCarRequest,
  handleSearchClick,
  openFilterPanel,
  setOpenFilterPanel,
  t,
}: {
  searchCarRequest: SearchCarRequest;
  setSearchCarRequest: Dispatch<React.SetStateAction<SearchCarRequest>>;
  handleSearchClick: () => Promise<void>;
  openFilterPanel: boolean;
  setOpenFilterPanel: Dispatch<React.SetStateAction<boolean>>;
  t: TFunctionNext;
}) {
  const t_comp = (element: string) => {
    return t("filter_sliding_panel." + element);
  };

  const { closeFilterOnSearchPage } = useAppContext();

  const [selectedMakeID, setSelectedMakeID] = useState<string>("");
  const [selectedModelID, setSelectedModelID] = useState<string>("");

  function handleClose() {
    setOpenFilterPanel(false);
    closeFilterOnSearchPage();
  }

  return (
    <div className="sliding-panel-container fixed left-0 top-0 w-full">
      <SlidingPanel
        type={"left"}
        isOpen={openFilterPanel}
        size={100}
        noBackdrop={false}
        backdropClicked={handleClose}
        panelContainerClassName="sliding-panel"
      >
        <div className="flex flex-col py-8">
          <div className="mr-8 self-end">
            <i className="fi fi-br-cross" onClick={handleClose}></i>
          </div>
          <div className="mt-4 flex flex-col gap-2 px-2 sm:gap-4 sm:px-4 md:px-8 lg:px-16">
            <RntCarMakeSelect
              id={"filter-brand"}
              label={t_comp("brand")}
              value={searchCarRequest.searchFilters.brand}
              onMakeSelect={(newID, newMake) => {
                setSelectedMakeID(newID);
                setSearchCarRequest({
                  ...searchCarRequest,
                  searchFilters: { ...searchCarRequest.searchFilters, brand: newMake },
                });
              }}
            />

            <RntCarModelSelect
              id={"filter-model"}
              label={t_comp("model")}
              value={searchCarRequest.searchFilters.model}
              make_id={selectedMakeID}
              onModelSelect={(newID, newModel) => {
                setSelectedModelID(newID);
                setSearchCarRequest({
                  ...searchCarRequest,
                  searchFilters: { ...searchCarRequest.searchFilters, model: newModel },
                });
              }}
            />
            <RntCarYearSelect
              id="filter-year-from"
              label={t_comp("year_from")}
              make_id={selectedMakeID}
              model_id={selectedModelID}
              value={Number(searchCarRequest.searchFilters.yearOfProductionFrom)}
              onYearSelect={(newYear) => {
                setSearchCarRequest({
                  ...searchCarRequest,
                  searchFilters: { ...searchCarRequest.searchFilters, yearOfProductionFrom: newYear.toString() },
                });
              }}
            />
            <RntInput
              id="filter-year-yo"
              label={t_comp("year_to")}
              value={searchCarRequest.searchFilters.yearOfProductionTo}
              onChange={(e) => {
                const newValue = e.target.value;
                if (isNaN(Number(newValue)) && newValue !== "") return;

                setSearchCarRequest({
                  ...searchCarRequest,
                  searchFilters: { ...searchCarRequest.searchFilters, yearOfProductionTo: newValue },
                });
              }}
            />
            <RntInput
              id="filter-price-from"
              label={t_comp("price_from")}
              value={searchCarRequest.searchFilters.pricePerDayInUsdFrom}
              onChange={(e) => {
                const newValue = e.target.value;
                if (isNaN(Number(newValue)) && newValue !== "") return;
                setSearchCarRequest({
                  ...searchCarRequest,
                  searchFilters: { ...searchCarRequest.searchFilters, pricePerDayInUsdFrom: newValue },
                });
              }}
            />
            <RntInput
              id="filter-price-yo"
              label={t_comp("price_to")}
              value={searchCarRequest.searchFilters.pricePerDayInUsdTo}
              onChange={(e) => {
                const newValue = e.target.value;
                if (isNaN(Number(newValue)) && newValue !== "") return;

                setSearchCarRequest({
                  ...searchCarRequest,
                  searchFilters: { ...searchCarRequest.searchFilters, pricePerDayInUsdTo: newValue },
                });
              }}
            />
            <div className="flex flex-col gap-4 max-sm:mt-2 sm:flex-row sm:justify-between sm:gap-8">
              <RntButton
                className="max-sm:h-10 max-sm:w-full"
                onClick={() => {
                  handleClose();
                  handleSearchClick();
                }}
              >
                {t_comp("button_apply")}
              </RntButton>
              <RntButton
                className="max-sm:h-10 max-sm:w-full"
                onClick={() =>
                  setSearchCarRequest((prev) => {
                    return {
                      ...prev,
                      searchFilters: {
                        brand: "",
                        model: "",
                        pricePerDayInUsdFrom: "",
                        pricePerDayInUsdTo: "",
                        yearOfProductionFrom: "",
                        yearOfProductionTo: "",
                      },
                    };
                  })
                }
              >
                {t_comp("button_reset")}
              </RntButton>
            </div>
          </div>
        </div>
      </SlidingPanel>
    </div>
  );
}
