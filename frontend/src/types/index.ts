export interface Message {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    updated_at?: string;
    is_bot: boolean;
  }

  export interface User {
    id: string;
    username: string;
  }