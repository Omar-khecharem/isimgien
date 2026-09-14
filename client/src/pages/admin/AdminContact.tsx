import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "../../hooks/useSocket";
import type { Message } from "../../hooks/useSocket";
import {
  getContacts,
  getMessages,
} from "../../features/messaging/messagingService";
import type {
  ContactUser,
  ChatMessage,
} from "../../features/messaging/messagingService";
import styles from "./AdminContact.module.css";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  club_leader: "Leader",
  student: "Étudiant",
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function AdminContactPage() {
  const { connected, onlineUsers, sendMessage, markAsRead, startTyping, stopTyping, onNewMessage, onUserOnline, onTypingStart, onTypingStop } = useSocket();

  const [contacts, setContacts] = useState<ContactUser[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    getContacts()
      .then(setContacts)
      .catch(console.error)
      .finally(() => setLoadingContacts(false));
  }, []);

  useEffect(() => {
    const unsubNew = onNewMessage((msg: Message) => {
      setContacts((prev) => {
        const contactId = msg.sender._id === selectedContact?._id ? msg.sender._id : msg.receiver._id;
        const exists = prev.find((c) => c._id === contactId);
        if (exists) {
          return prev
            .map((c) =>
              c._id === contactId
                ? { ...c, lastMessage: { _id: msg._id, content: msg.content, createdAt: msg.createdAt, sender: msg.sender._id }, unreadCount: msg.sender._id === selectedContact?._id ? 0 : c.unreadCount + 1 }
                : c
            )
            .sort((a, b) => {
              if (!a.lastMessage) return 1;
              if (!b.lastMessage) return -1;
              return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
            });
        }
        return prev;
      });

      if (selectedContact && (msg.sender._id === selectedContact._id || msg.receiver._id === selectedContact._id)) {
        setMessages((prev) => {
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg as unknown as ChatMessage];
        });
      }
    });

    const unsubOnline = onUserOnline(({ userId, online }) => {
      setContacts((prev) =>
        prev.map((c) => (c._id === userId ? { ...c, online } : c))
      );
    });

    const unsubTypingStart = onTypingStart(({ userId }) => {
      setTypingUsers((prev) => new Set(prev).add(userId));
    });

    const unsubTypingStop = onTypingStop(({ userId }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      unsubNew();
      unsubOnline();
      unsubTypingStart();
      unsubTypingStop();
    };
  }, [selectedContact, onNewMessage, onUserOnline, onTypingStart, onTypingStop]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = useCallback(async (contact: ContactUser) => {
    setLoadingMessages(true);
    setSelectedContact(contact);
    setMessages([]);
    try {
      const msgs = await getMessages(contact._id);
      setMessages(msgs);
      markAsRead(contact._id);
      setContacts((prev) =>
        prev.map((c) => (c._id === contact._id ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
      inputRef.current?.focus();
    }
  }, [markAsRead]);

  const handleSend = () => {
    if (!inputValue.trim() || !selectedContact) return;
    sendMessage(selectedContact._id, inputValue.trim());
    setInputValue("");
    stopTyping(selectedContact._id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!selectedContact) return;
    startTyping(selectedContact._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedContact._id);
    }, 2000);
  };

  const getMyUserId = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId;
    } catch {
      return "";
    }
  };

  const myUserId = getMyUserId();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Messages</h1>
          <span className={`${styles.statusDot} ${connected ? styles.statusDotOnline : ""}`} />
          <span className={styles.statusText}>{connected ? "Connecté" : "Déconnecté"}</span>
        </div>
      </div>

      <div className={styles.container}>
        {/* Contacts Panel */}
        <div className={styles.contactsPanel}>
          <div className={styles.contactsHeader}>
            <h2 className={styles.contactsTitle}>Conversations</h2>
          </div>
          <div className={styles.contactsList}>
            {loadingContacts ? (
              <div className={styles.loading}><div className={styles.loadingDot} /><div className={styles.loadingDot} /><div className={styles.loadingDot} /></div>
            ) : contacts.length === 0 ? (
              <div className={styles.emptyContacts}>
                <p>Aucune conversation</p>
              </div>
            ) : (
              contacts.map((contact) => {
                const isActive = selectedContact?._id === contact._id;
                const isOnline = onlineUsers.has(contact._id) || (contact as any).online;
                const isTyping = typingUsers.has(contact._id);
                return (
                  <button key={contact._id} className={`${styles.contactItem} ${isActive ? styles.contactItemActive : ""}`} onClick={() => loadMessages(contact)}>
                    <div className={styles.contactAvatar}>
                      <span className={styles.contactInitials}>{getInitials(contact.firstName, contact.lastName)}</span>
                      <span className={`${styles.contactStatus} ${isOnline ? styles.contactStatusOnline : styles.contactStatusOffline}`} />
                    </div>
                    <div className={styles.contactInfo}>
                      <span className={styles.contactName}>{contact.firstName} {contact.lastName}</span>
                      <span className={styles.contactRole}>
                        {isTyping ? <span className={styles.typingText}>écrit...</span> : contact.lastMessage ? (contact.lastMessage.content.length > 30 ? contact.lastMessage.content.slice(0, 30) + "..." : contact.lastMessage.content) : ROLE_LABELS[contact.role] || contact.role}
                      </span>
                    </div>
                    {contact.unreadCount > 0 && <span className={styles.unreadBadge}>{contact.unreadCount}</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className={styles.chatPanel}>
          {!selectedContact ? (
            <div className={styles.noChat}>
              <div className={styles.noChatIcon}>💬</div>
              <h3>Sélectionnez une conversation</h3>
              <p>Choisissez un contact pour commencer à discuter</p>
            </div>
          ) : (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderLeft}>
                  <div className={styles.chatAvatar}>
                    <span className={styles.chatAvatarInitials}>{getInitials(selectedContact.firstName, selectedContact.lastName)}</span>
                  </div>
                  <div>
                    <span className={styles.chatName}>{selectedContact.firstName} {selectedContact.lastName}</span>
                    <span className={styles.chatStatusText}>{ROLE_LABELS[selectedContact.role] || selectedContact.role} {typingUsers.has(selectedContact._id) ? "· écrit..." : ""}</span>
                  </div>
                </div>
              </div>

              <div className={styles.messagesArea}>
                {loadingMessages ? (
                  <div className={styles.loading}><div className={styles.loadingDot} /><div className={styles.loadingDot} /><div className={styles.loadingDot} /></div>
                ) : messages.length === 0 ? (
                  <div className={styles.emptyMessages}>
                    <p>Commencez la conversation avec {selectedContact.firstName}</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const isMine = msg.sender._id === myUserId;
                      const showDate = i === 0 || formatDate(msg.createdAt) !== formatDate(messages[i - 1].createdAt);
                      return (
                        <div key={msg._id}>
                          {showDate && (
                            <div className={styles.dateSeparator}>
                              <span>{formatDate(msg.createdAt)}</span>
                            </div>
                          )}
                          <div className={`${styles.message} ${isMine ? styles.messageMine : styles.messageTheirs}`}>
                            {!isMine && (
                              <div className={styles.messageAvatar}>
                                <span>{getInitials(selectedContact.firstName, selectedContact.lastName)[0]}</span>
                              </div>
                            )}
                            <div className={styles.messageBubble}>
                              <p className={styles.messageText}>{msg.content}</p>
                              <span className={styles.messageTime}>{formatTime(msg.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <div className={styles.inputArea}>
                <div className={styles.inputWrap}>
                  <input ref={inputRef} className={styles.input} type="text" placeholder="Écrire un message..." value={inputValue} onChange={handleInputChange} onKeyDown={handleKeyDown} />
                  <button className={styles.sendBtn} onClick={handleSend} disabled={!inputValue.trim()}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
