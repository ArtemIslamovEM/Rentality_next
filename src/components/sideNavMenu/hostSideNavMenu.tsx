import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";
import SideNavMenuItem from "./sideNavMenuItem";

export default function HostSideNavMenu() {
  return (
    <BaseSideNavMenu>
      <SideNavMenuGroup title="Trips">
        <SideNavMenuItem text="Booked" href="/host/trips/booked" />
        <SideNavMenuItem text="History" href="/host/trips/history" />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="Vehicles">
        <SideNavMenuItem text="Listing" href="/host/vehicles/listings" />
      </SideNavMenuGroup>
    </BaseSideNavMenu>
  );
}