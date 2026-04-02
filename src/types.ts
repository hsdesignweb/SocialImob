export interface PlannerPost {
  id: string;
  date: string; // Formato YYYY-MM-DD
  title: string;
  format: string;
  media_link: string;
  script: string;
  caption: string;
  bonus?: string;
  image_prompt?: string;
  completed: number;
}

export interface ImportantDate {
  id: string;
  month: number; // 0 a 11
  day: string;
  label: string;
}
