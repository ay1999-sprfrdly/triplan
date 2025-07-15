
export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  description: string;
  link?: string;
}

export interface DayPlan {
  date: string;
  items: ItineraryItem[];
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  color: string;
  days: DayPlan[];
  memo?: string;
}