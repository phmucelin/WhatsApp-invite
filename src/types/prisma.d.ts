import { Prisma } from "@prisma/client";

// Tipos base do Prisma
export type {
  User,
  Event,
  Guest,
} from "@prisma/client";

// Tipos para Guest
export type GuestWithEvent = Prisma.GuestGetPayload<{
  include: {
    event: {
      select: {
        title: true;
        date: true;
      };
    };
  };
}>;

// Tipo para Guest Status
export type GuestStatus = {
  sendStatus: string;
  rsvpStatus: string;
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
