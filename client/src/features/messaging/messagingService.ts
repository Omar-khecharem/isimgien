import { apiClient } from "../../services/apiClient";

export interface ContactUser {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  unreadCount: number;
  lastMessage?: {
    _id: string;
    content: string;
    createdAt: string;
    sender: string;
  };
}

export interface ChatMessage {
  _id: string;
  sender: { _id: string; firstName: string; lastName: string; role: string; avatar?: string };
  receiver: { _id: string; firstName: string; lastName: string; role: string; avatar?: string };
  content: string;
  read: boolean;
  createdAt: string;
}

export interface SearchUser {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

export async function getContacts(): Promise<ContactUser[]> {
  return apiClient.get<ContactUser[]>("/messaging/contacts");
}

export async function getMessages(contactId: string): Promise<ChatMessage[]> {
  return apiClient.get<ChatMessage[]>(`/messaging/messages/${contactId}`);
}

export async function searchUsers(query: string): Promise<SearchUser[]> {
  return apiClient.get<SearchUser[]>("/messaging/search-users", { q: query });
}
