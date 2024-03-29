import { useState } from "react";
import RntButton from "../common/rntButton";
import { useUserInfo } from "@/contexts/userInfoContext";
import { useRentality } from "@/contexts/rentalityContext";
import { formatAddress } from "@/utils/addressFormatters";
import { Avatar, Stack, styled, Switch, Typography } from "@mui/material";
import { isEmpty } from "@/utils/string";
import burgerMenu from "../../images/ic-menu-burge-white-20.svg";
import burgerMenuClose from "../../images/ic-menu-burge-close-white-20.svg";
import Image from "next/image";
import GuestBurgerNavMenu from "@/components/sideNavMenu/guestBurgerNavMenu";
import HostBurgerNavMenu from "@/components/sideNavMenu/hostBurgerNavMenu";

type Props = {
  accountType: string;
};

export default function Header({ accountType }: Props) {
  // const [userConnected, userWeb3Address, formatAddress, connectMetaMask] =
  //   useEtherProvider();
  const rentalityInfo = useRentality();
  const userInfo = useUserInfo();
  accountType = accountType ?? "Host";
  const isHost = accountType === "Host";

  // const isActiveBurgerMenu = false;
  const [isActiveBurgerMenu, setIsActiveBurgerMenu] = useState(false);

  const toggleBurgerMenu = () => {
    setIsActiveBurgerMenu(!isActiveBurgerMenu);
    const body = document.body;
    if (isActiveBurgerMenu) {
      body.classList.remove("max-lg:overflow-hidden");
    } else {
      body.classList.add("max-lg:overflow-hidden");
    }
  };

  const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 72,
    height: 30,
    padding: 0,
    display: "flex",
    "&:active": {
      "& .MuiSwitch-thumb": {
        width: 15,
      },
      "& .MuiSwitch-switchBase.Mui-checked": {
        transform: "translateX(42px)",
      },
    },
    "& .MuiSwitch-switchBase": {
      padding: 2,
      "&.Mui-checked": {
        transform: "translateX(42px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          opacity: 1,
          backgroundColor: "#6D28D9",
        },
      },
    },
    "& .MuiSwitch-thumb": {
      boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
      width: 26,
      height: 26,
      borderRadius: 18,
      transition: theme.transitions.create(["width"], {
        duration: 700,
      }),
    },
    "& .MuiSwitch-track": {
      borderRadius: 30 / 2,
      opacity: 1,
      backgroundColor: "#6D28D9",
      boxSizing: "border-box",
    },
  }));

  const [checked, setChecked] = useState(isHost);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    if (event.target.checked) {
      window.location.href = "/host";
    } else {
      window.location.href = "/guest";
    }
  };

  return (
    <div>
      {isActiveBurgerMenu && (
        <div className="fixed top-[7rem] left-0 w-full h-full z-[100] bg-[#1E1E30] overflow-auto lg:hidden">
          {isHost ? <HostBurgerNavMenu /> : <GuestBurgerNavMenu />}
        </div>
      )}
      <header className="bg-rentality-bg-main text-rnt-temp-header-text">
        <div className="flex w-full px-2 py-2 min-h-[7rem] justify-between">
          <div className="flex flex-row items-center">
            <Image
              src={isActiveBurgerMenu ? burgerMenuClose : burgerMenu}
              alt=""
              className="lg:hidden mr-4"
              onClick={toggleBurgerMenu}
            />
            <div className="font-bold text-xl lg:text-3xl max-sm:hidden">{accountType} account</div>
          </div>
          <div className="flex flex-row items-center">
            {/*<div className="flex flex-row mr-16 max-xl:mr-8 max-lg:hidden">*/}
            {/*  {isHost ? (*/}
            {/*      <Link href="/guest">*/}
            {/*        <RntButton className="w-48 h-10">Switch to Guest</RntButton>*/}
            {/*      </Link>*/}
            {/*  ) : (*/}
            {/*      <Link href="/host">*/}
            {/*        <RntButton className="w-48 h-10">Switch to Host</RntButton>*/}
            {/*      </Link>*/}
            {/*  )}*/}
            {/*</div>*/}
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography className="text-lg">Guest</Typography>
              <AntSwitch checked={checked} onChange={handleChange} inputProps={{ "aria-label": "ant design" }} />
              <Typography className="text-lg">Host</Typography>
            </Stack>
            {rentalityInfo?.isWalletConnected ? (
              <div className="flex flex-row gap-4 max-xl:ml-16 ml-16 items-center">
                <div className=" flex-col hidden xl:flex">
                  <div>
                    {userInfo.firstName} {userInfo.lastName}
                  </div>
                  <div className="text-sm">{formatAddress(rentalityInfo?.walletAddress)}</div>
                </div>
                <Avatar
                  alt={`${userInfo.firstName} ${userInfo.lastName}`}
                  src={userInfo.profilePhotoUrl}
                  sx={{ width: "5rem", height: "5rem" }}
                >
                  {!isEmpty(userInfo.firstName) || !isEmpty(userInfo.lastName)
                    ? userInfo.firstName?.slice(0, 1).toUpperCase() + userInfo.lastName?.slice(0, 1).toUpperCase()
                    : null}
                </Avatar>
              </div>
            ) : (
              <RntButton
                className="w-40 h-10 text-md"
                onClick={() => {
                  rentalityInfo?.connectWallet();
                }}
              >
                Connect MetaMask
              </RntButton>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
