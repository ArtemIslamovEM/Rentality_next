import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import TripCard from "@/components/tripCard/tripCard";
import useHostTrips from "@/hooks/host/useHostTrips";
import { useTranslation } from "react-i18next";

export default function History() {
  const [isLoading, _, tripsHistory] = useHostTrips();
  const { t } = useTranslation();

  const changeStatusCallback = async (changeStatus: () => Promise<boolean>) => {};

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("booked.history_title")} />
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            {t("common.info.loading")}
          </div>
        ) : (
          <div className="my-4 flex flex-col gap-4">
            {tripsHistory != null && tripsHistory.length > 0 ? (
              tripsHistory.map((value) => {
                return (
                  <TripCard
                    key={value.tripId}
                    tripInfo={value}
                    changeStatusCallback={changeStatusCallback}
                    disableButton={true}
                    isHost={true}
                    t={t}
                  />
                );
              })
            ) : (
              <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
<<<<<<< HEAD
                {t("booked.history_no_trips")}
=======
                {"You don't have any booked trips"}
>>>>>>> feature/v0_17
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
