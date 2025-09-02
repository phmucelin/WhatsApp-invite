import { Prisma } from "@prisma/client";

// Tipos base do Prisma
export type {
  User,
  Event,
  Guest,
  SendStatus,
  RsvpStatus,
} from "@prisma/client";

// Tipos para Guest
export type GuestWithEvent = Prisma.GuestGetPayload<{
  include: {
    event: {
      select: {
        title: true;
      };
    };
  };
}>;

// Tipo para Guest Status
export type GuestStatus = {
  sendStatus: SendStatus;
  rsvpStatus: RsvpStatus;
};

// Tipos para Event
export type EventWithGuests = Prisma.EventGetPayload<{
  include: {
    _count: {
      select: {
        guests: true;
      };
    };
    guests: {
      select: {
        sendStatus: true;
        rsvpStatus: true;
      };
    };
  };
}> & {
  guests: GuestStatus[];
}; 