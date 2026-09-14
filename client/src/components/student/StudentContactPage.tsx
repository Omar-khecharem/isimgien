import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../features/auth";
import styles from "./StudentContactPage.module.css";

interface Contact {
  id: string;
  name: string;
  role: "leader" | "admin";
  avatar?: string | null;
  status: "online" | "offline";
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

const CONTACTS: Contact[] = [
  { id: "admin1", name: "Super Admin", role: "admin", status: "online" },
  { id: "leader1", name: "Club Leader", role: "leader", status: "online" },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    senderId: "system",
    text: "Bienvenue dans la messagerie. Contactez votre leader ou l'administrateur.",
    timestamp: new Date(Date.now() - 60000),
  },
];

export function StudentContactPage() {
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState<Contact>(CONTACTS[0]);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: user?.id ?? "student",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    setTimeout(() => {
      const autoReply: Message = {
        id: `reply-${Date.now()}`,
        senderId: selectedContact.id,
        text: "Merci pour votre message. Je vous répondrai dès que possible.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, autoReply]);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Contacts Sidebar */}
        <div className={styles.contactsPanel}>
          <div className={styles.contactsHeader}>
            <h2 className={styles.contactsTitle}>Contacts</h2>
          </div>
          <div className={styles.contactsList}>
            {CONTACTS.map((c) => (
              <button
                key={c.id}
                className={`${styles.contactItem} ${selectedContact.id === c.id ? styles["contactItem--active"] : ""}`}
                onClick={() => setSelectedContact(c)}
              >
                <div className={styles.contactAvatar}>
                  <span className={styles.contactInitials}>
                    {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </span>
                  <span className={`${styles.contactStatus} ${styles[`contactStatus--${c.status}`]}`} />
                </div>
                <div className={styles.contactInfo}>
                  <span className={styles.contactName}>{c.name}</span>
                  <span className={styles.contactRole}>
                    {c.role === "admin" ? "Administrateur" : "Leader de club"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderLeft}>
              <div className={styles.chatAvatar}>
                <span className={styles.chatAvatarInitials}>
                  {selectedContact.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
                <span className={`${styles.chatStatus} ${styles[`chatStatus--${selectedContact.status}`]}`} />
              </div>
              <div>
                <span className={styles.chatName}>{selectedContact.name}</span>
                <span className={styles.chatStatusText}>
                  {selectedContact.status === "online" ? "En ligne" : "Hors ligne"}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.messagesArea}>
            {messages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              const isSystem = msg.senderId === "system";
              const isContact = msg.senderId === selectedContact.id;

              if (isSystem) {
                return (
                  <div key={msg.id} className={styles.systemMessage}>
                    <span>{msg.text}</span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`${styles.message} ${isMine ? styles["message--mine"] : styles["message--theirs"]}`}
                >
                  {!isMine && (
                    <div className={styles.messageAvatar}>
                      <span>{selectedContact.name.split(" ").map((w) => w[0]).join("").slice(0, 1)}</span>
                    </div>
                  )}
                  <div className={styles.messageBubble}>
                    <p className={styles.messageText}>{msg.text}</p>
                    <span className={styles.messageTime}>
                      {msg.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <div className={styles.inputWrap}>
              <input
                className={styles.input}
                type="text"
                placeholder="Écrire un message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className={styles.sendBtn}
                onClick={handleSend}
                disabled={!input.trim()}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M16 2L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 2l-5 14-2.5-6.5L2 7l14-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
