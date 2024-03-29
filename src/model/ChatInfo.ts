import { ChatMessage } from "./ChatMessage";
import { TripStatus } from "./TripInfo";

export type ChatInfo = {
  tripId: number;

  guestAddress: string;
  guestName: string;
  guestPhotoUrl: string;

  hostAddress: string;
  hostName: string;
  hostPhotoUrl: string;

  tripTitle: string;
  lastMessage: string;

  carPhotoUrl: string;
  tripStatus: TripStatus;
  carTitle: string;
  carLicenceNumber: string;

  messages: ChatMessage[];
};
