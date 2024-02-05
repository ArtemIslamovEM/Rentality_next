import ChatPage from "@/components/chat/chatPage";
import RntDialogs from "@/components/common/rntDialogs";
import HostLayout from "@/components/host/layout/hostLayout";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useChat } from "@/contexts/chatContext";
import useRntDialogs from "@/hooks/useRntDialogs";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

export default function Messages() {
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] = useRntDialogs();
  const { dataFetched, chatInfos, sendMessage } = useChat();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedTridId = Number(searchParams.get("tridId") ?? -1);

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams();
    params.set(name, value);

    return params.toString();
  };

  const selectChat = (tripId: number) => {
    const pageParams = tripId > 0 ? "?" + createQueryString("tridId", tripId.toString()) : "";
    router.push(pathname + pageParams, pathname + pageParams, { shallow: true, scroll: false });
  };

  return (
    <HostLayout>
      <div className="flex flex-col">
        <PageTitle title="Chats" />
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <ChatPage
            isHost={true}
            chats={chatInfos}
            sendMessage={sendMessage}
            selectedTridId={selectedTridId}
            selectChat={selectChat}
          />
        )}
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </HostLayout>
  );
}
