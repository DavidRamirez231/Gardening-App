
export interface PlantInfo {
  plantName: string;
  description: string;
  history: string;
  careSteps: string[];
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}