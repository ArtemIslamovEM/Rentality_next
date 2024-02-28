import { MutableRefObject, memo, useState } from "react";
import { TripInfo, TripStatus, getRefuelValueAndCharge } from "@/model/TripInfo";
import Checkbox from "../common/checkbox";
import { calculateDays } from "@/utils/date";
import RntSelect from "../common/rntSelect";
import RntInput from "../common/rntInput";
import RntButton from "../common/rntButton";
import AllowedActionsForStatusStarted from "../guest/allowedActionsForStatusStarted";
import AllowedActions from "../guest/allowedActions";

function TripAdditionalActions({
  tripInfo,
  changeStatusCallback,
  disableButton,
  refForScrool,
  isHost,
}: {
  tripInfo: TripInfo;
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<void>;
  disableButton: boolean;
  refForScrool?: MutableRefObject<HTMLDivElement>;
  isHost: boolean;
}) {
  const defaultValues =
    tripInfo?.allowedActions?.length > 0
      ? tripInfo?.allowedActions[0].params.map((i) => {
          return i.value;
        })
      : [];
  const [inputParams, setInputParams] = useState<string[]>(defaultValues);
  const [confirmParams, setConfirmParams] = useState<boolean[]>([]);

  const { refuelValue, refuelCharge } = getRefuelValueAndCharge(tripInfo, tripInfo.endFuelLevelInPercents);
  const tripDays = calculateDays(tripInfo.tripStart, tripInfo.tripEnd);
  var overmileValue = tripInfo.endOdometr - tripInfo.startOdometr - tripInfo.milesIncludedPerDay * tripDays;
  overmileValue = overmileValue > 0 ? overmileValue : 0;

  const handleButtonClick = () => {
    if (tripInfo == null || tripInfo.allowedActions == null || tripInfo.allowedActions.length == 0) {
      return;
    }

    if (
      tripInfo.allowedActions[0].readonly &&
      (confirmParams.length != defaultValues.length || !confirmParams.every((i) => i === true))
    ) {
      return;
    }

    changeStatusCallback(() => {
      return tripInfo.allowedActions[0].action(BigInt(tripInfo.tripId), inputParams);
    });
  };

  if (isHost)
    return (
      <div className="flex flex-col px-8 pt-2 pb-4" ref={refForScrool}>
        <hr />
        <div id="trip-allowed-actions">
          <strong className="text-xl">
            Please {tripInfo.allowedActions[0].readonly ? "confirm" : "enter"} data to change status:
          </strong>
        </div>

        <div className="flex flex-col gap-4 py-4">
          {tripInfo.allowedActions[0].params.map((param, index) => {
            return (
              <div className="flex flex-col md:flex-row" key={param.text}>
                <div className="flex items-end w-full md:w-1/2 xl:w-1/3">
                  {param.type === "fuel" ? (
                    <RntSelect
                      className="w-full"
                      id={param.text}
                      label={param.text}
                      readOnly={tripInfo.allowedActions[0].readonly}
                      value={inputParams[index]}
                      onChange={(e) => {
                        setInputParams((prev) => {
                          const copy = [...prev];
                          copy[index] = e.target.value;
                          return copy;
                        });
                      }}
                    >
                      <option className="hidden" disabled></option>
                      <option value="0">0%</option>
                      <option value="0.1">10%</option>
                      <option value="0.2">20%</option>
                      <option value="0.3">30%</option>
                      <option value="0.4">40%</option>
                      <option value="0.5">50%</option>
                      <option value="0.6">60%</option>
                      <option value="0.7">70%</option>
                      <option value="0.8">80%</option>
                      <option value="0.9">90%</option>
                      <option value="1">100%</option>
                    </RntSelect>
                  ) : (
                    <RntInput
                      className="w-full"
                      id={param.text}
                      label={param.text}
                      readOnly={tripInfo.allowedActions[0].readonly}
                      value={inputParams[index]}
                      onChange={(e) => {
                        setInputParams((prev) => {
                          const copy = [...prev];
                          copy[index] = e.target.value;
                          return copy;
                        });
                      }}
                    />
                  )}

                  {tripInfo.allowedActions[0].readonly ? (
                    <Checkbox
                      className="ml-4"
                      title="Confirm"
                      value={confirmParams[index]}
                      onChange={(newValue) => {
                        setConfirmParams((prev) => {
                          const copy = [...prev];
                          copy[index] = newValue.target.checked;
                          return copy;
                        });
                      }}
                    />
                  ) : null}
                </div>

                {tripInfo.status === TripStatus.CheckedOutByGuest ? (
                  param.type === "fuel" ? (
                    <div className="md:w-1/2 xl:w-1/4 md:mx-8 xl:mx-28 grid grid-cols-2 text-sm">
                      <span className="font-bold col-span-2">Reimbursement charge:</span>
                      <span>Refuel:</span>
                      <span>{refuelValue} gal</span>
                      <span>Gal price:</span>
                      <span>${tripInfo.fuelPricePerGal.toFixed(2)}</span>
                      <span>Refuel or battery charge:</span>
                      <span>${refuelCharge.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="md:w-1/2 xl:w-1/4 md:mx-8 xl:mx-28 grid grid-cols-2 text-sm">
                      <span className="font-bold col-span-2">Reimbursement charge:</span>
                      <span>Overmiles:</span>
                      <span>{overmileValue}</span>
                      <span>Overmile price:</span>
                      <span>${tripInfo.overmilePrice.toFixed(4)}</span>
                      <span>Overmile charge:</span>
                      <span>${(overmileValue * tripInfo.overmilePrice).toFixed(2)}</span>
                    </div>
                  )
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex flex-row gap-4">
          {tripInfo.allowedActions.map((action) => {
            return (
              <RntButton
                key={action.text}
                className="max-sm_inverted:w-full h-16 px-4"
                disabled={disableButton}
                onClick={() => {
                  if (action.params == null || action.params.length == 0) {
                    changeStatusCallback(() => {
                      return action.action(BigInt(tripInfo.tripId), []);
                    });
                  } else {
                    handleButtonClick();
                  }
                }}
              >
                {action.text}
              </RntButton>
            );
          })}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col px-8 pt-2 pb-4" ref={refForScrool}>
      <hr />
      <div id="trip-allowed-actions">
        <strong className="text-xl">
          Please {tripInfo.allowedActions[0].readonly ? "confirm" : "enter"} data to change status:
        </strong>
      </div>
      {tripInfo.status === TripStatus.Started ? (
        <AllowedActionsForStatusStarted
          tripInfo={tripInfo}
          params={tripInfo.allowedActions[0].params}
          inputParams={inputParams}
          setInputParams={setInputParams}
        />
      ) : (
        <AllowedActions
          tripInfo={tripInfo}
          inputParams={inputParams}
          setInputParams={setInputParams}
          confirmParams={confirmParams}
          setConfirmParams={setConfirmParams}
        />
      )}

      <div className="flex flex-row gap-4">
        {tripInfo.allowedActions.map((action) => {
          return (
            <RntButton
              key={action.text}
              className="max-sm_inverted:w-full h-16 px-4"
              disabled={disableButton}
              onClick={() => {
                if (action.params == null || action.params.length == 0) {
                  changeStatusCallback(() => {
                    return action.action(BigInt(tripInfo.tripId), []);
                  });
                } else {
                  handleButtonClick();
                }
              }}
            >
              {action.text}
            </RntButton>
          );
        })}
      </div>
    </div>
  );
}

export default memo(TripAdditionalActions);