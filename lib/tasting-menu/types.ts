export type TastingSlot = {
  startTime: string;
  endTime: string;
  availableSlots: number;
};

export type TastingDay = {
  date: string;
  slots: TastingSlot[];
};

export type TastingMonth = {
  month: string;
  eventName: string;
  location: string;
  minimumAttendees: number;
  days: TastingDay[];
};

export type CartAttribute = {
  key: string;
  value: string;
};
