export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface PortfolioItem {
  title: string;
  category: string;
  description: string;
  tags: string[];
  link?: string;
  date: string;
}

export interface InfoCard {
  title: string;
  description: string;
  icon: string;
}
