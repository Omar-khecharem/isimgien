import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../features/auth";
import { getContacts, getMessages } from "../../features/messaging/messagingService";
import type { ContactUser, ChatMessage } from "../../features/messaging/messagingService";
import { useSocket } from "../../hooks/useSocket";
import styles from "./StudentContactPage.module.css";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  club_leader: "Leader de club",
  student: "Étudiant",
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

function getAvatarColor(id: string) {
  const colors = [
    "#059669", "#0891b2", "#7c3aed", "#db2777",
    "#ea580c", "#16a34a", "#2563eb", "#9333ea",
  ];
  let hash = 0;
  for (const ch of id) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function StudentContactPage() {
  const { user } = useAuth();
  const {
    onlineUsers,
    sendMessage: socketSend,
    markAsRead,
    startTyping,
    stopTyping,
    onNewMessage,
    onUserOnline,
    onTypingStart,
    onTypingStop,
  } = useSocket();

  const [contacts, setContacts] = useState<ContactUser[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Fetch contacts ─────────────────────────────────────────────── */
  useEffect(() => {
    getContacts()
      .then((c) => {
        setContacts(c);
        if (c.length > 0) setSelectedContact(c[0]);
      })
      .catch(console.error)
      .finally(() => setLoadingContacts(false));
  }, []);

  /* ── Load messages when selecting a contact ─────────────────────── */
  const loadMessages = useCallback(
    async (contact: ContactUser) => {
      setSelectedContact(contact);
      setLoadingMessages(true);
      setMessages([]);
      try {
        const msgs = await getMessages(contact._id);
        setMessages(msgs);
        markAsRead(contact._id);
        setContacts((prev) =>
          prev.map((c) =>
            c._id === contact._id ? { ...c, unreadCount: 0 } : c
          )
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMessages(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [markAsRead]
  );

  /* ── Socket: new message ────────────────────────────────────────── */
  useEffect(() => {
    const unsub = onNewMessage((msg) => {
      const contactId =
        msg.sender._id === selectedContact?._id
          ? msg.sender._id
          : msg.receiver._id === user?.id
          ? msg.sender._id
          : null;

      if (contactId === selectedContact?._id) {
        setMessages((prev) => [...prev, msg]);
        markAsRead(selectedContact._id);
      }

      setContacts((prev) =>
        prev.map((c) => {
          if (c._id !== contactId) return c;
          return {
            ...c,
            lastMessage: {
              _id: msg._id,
              content: msg.content,
              createdAt: msg.createdAt,
              sender: msg.sender._id,
            },
            unreadCount:
              contactId === selectedContact?._id
                ? 0
                : (c.unreadCount ?? 0) + 1,
          };
        })
      );
    });
    return unsub;
  }, [onNewMessage, selectedContact, user?.id, markAsRead]);

  /* ── Socket: online status ──────────────────────────────────────── */
  useEffect(() => {
    const unsub = onUserOnline(({ userId, online }) => {
      setContacts((prev) =>
        prev.map((c) =>
          c._id === userId ? { ...c, online } : c
        )
      );
    });
    return unsub;
  }, [onUserOnline]);

  /* ── Socket: typing indicators ──────────────────────────────────── */
  useEffect(() => {
    const unsub1 = onTypingStart(({ userId }) => {
      setTypingUsers((prev) => new Set(prev).add(userId));
    });
    const unsub2 = onTypingStop(({ userId }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });
    return () => { unsub1(); unsub2(); };
  }, [onTypingStart, onTypingStop]);

  /* ── Scroll to bottom on new messages ───────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Send message ───────────────────────────────────────────────── */
  const handleSend = () => {
    const text = input.trim();
    if (!text || !selectedContact) return;
    socketSend(selectedContact._id, text);
    setInput("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    stopTyping(selectedContact._id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!selectedContact) return;
    startTyping(selectedContact._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedContact._id);
    }, 2000);
  };

  /* ── Derived state ──────────────────────────────────────────────── */
  const isOnline = selectedContact
    ? onlineUsers.has(selectedContact._id) || (selectedContact as any).online
    : false;
  const isTyping = selectedContact
    ? typingUsers.has(selectedContact._id)
    : false;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ── Contacts Sidebar ─────────────────────────────────────── */}
        <div className={styles.contactsPanel}>
          <div className={styles.contactsHeader}>
            <h2 className={styles.contactsTitle}>Contacts</h2>
            <span className={styles.contactsCount}>{contacts.length}</span>
          </div>
          <div className={styles.contactsList}>
            {loadingContacts ? (
              <div className={styles.contactsLoading}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.contactSkeleton}>
                    <div className={styles.contactAvatarSkeleton} />
                    <div className={styles.contactTextSkeleton}>
                      <div className={styles.contactNameSkeleton} />
                      <div className={styles.contactRoleSkeleton} />
                    </div>
                  </div>
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <div className={styles.contactsEmpty}>
                <p>Aucun contact disponible</p>
              </div>
            ) : (
              contacts.map((c) => {
                const isActive = selectedContact?._id === c._id;
                const cOnline =
                  onlineUsers.has(c._id) || (c as any).online;
                return (
                  <button
                    key={c._id}
                    className={`${styles.contactItem} ${isActive ? styles["contactItem--active"] : ""}`}
                    onClick={() => loadMessages(c)}
                  >
                    <div className={styles.contactAvatar}>
                      {c.avatar ? (
                        <img
                          src={c.avatar}
                          alt={`${c.firstName} ${c.lastName}`}
                          className={styles.contactAvatarImg}
                        />
                      ) : (
                        <span
                          className={styles.contactInitials}
                          style={{ background: getAvatarColor(c._id) }}
                        >
                          {getInitials(c.firstName, c.lastName)}
                        </span>
                      )}
                      <span
                        className={`${styles.contactStatus} ${cOnline ? styles.contactStatusOnline : styles.contactStatusOffline}`}
                      />
                    </div>
                    <div className={styles.contactInfo}>
                      <span className={styles.contactName}>
                        {c.firstName} {c.lastName}
                      </span>
                      <span className={styles.contactRole}>
                        {c.lastMessage
                          ? c.lastMessage.content.length > 28
                            ? c.lastMessage.content.slice(0, 28) + "..."
                            : c.lastMessage.content
                          : ROLE_LABELS[c.role] || c.role}
                      </span>
                    </div>
                    {(c.unreadCount ?? 0) > 0 && (
                      <span className={styles.unreadBadge}>{c.unreadCount}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat Panel ──────────────────────────────────────────── */}
        <div className={styles.chatPanel}>
          {selectedContact ? (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderLeft}>
                  <div className={styles.chatAvatar}>
                    {selectedContact.avatar ? (
                      <img
                        src={selectedContact.avatar}
                        alt={`${selectedContact.firstName} ${selectedContact.lastName}`}
                        className={styles.chatAvatarImg}
                      />
                    ) : (
                      <span
                        className={styles.chatAvatarInitials}
                        style={{ background: getAvatarColor(selectedContact._id) }}
                      >
                        {getInitials(selectedContact.firstName, selectedContact.lastName)}
                      </span>
                    )}
                    <span
                      className={`${styles.chatStatus} ${isOnline ? styles.chatStatusOnline : styles.chatStatusOffline}`}
                    />
                  </div>
                  <div>
                    <span className={styles.chatName}>
                      {selectedContact.firstName} {selectedContact.lastName}
                    </span>
                    <span className={styles.chatStatusText}>
                      {isTyping ? (
                        <span className={styles.typingText}>écrit...</span>
                      ) : isOnline ? (
                        "En ligne"
                      ) : (
                        "Hors ligne"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.messagesArea}>
                {loadingMessages ? (
                  <div className={styles.messagesLoading}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`${styles.messageSkeleton} ${i % 2 === 0 ? styles.messageSkeletonLeft : styles.messageSkeletonRight}`}
                      >
                        <div className={styles.bubbleSkeleton} />
                      </div>
                    ))}
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender._id === user?.id;
                    const sender = isMine ? msg.sender : msg.receiver;
                    const avatar = isMine
                      ? (user as any)?.avatar
                      : selectedContact.avatar;

                    return (
                      <div
                        key={msg._id}
                        className={`${styles.message} ${isMine ? styles["message--mine"] : styles["message--theirs"]}`}
                      >
                        {!isMine && (
                          <div className={styles.messageAvatar}>
                            {avatar ? (
                              <img
                                src={avatar}
                                alt=""
                                className={styles.messageAvatarImg}
                              />
                            ) : (
                              <span style={{ background: getAvatarColor(selectedContact._id) }}>
                                {getInitials(
                                  selectedContact.firstName,
                                  selectedContact.lastName
                                )}
                              </span>
                            )}
                          </div>
                        )}
                        <div className={styles.messageBubble}>
                          <p className={styles.messageText}>{msg.content}</p>
                          <span className={styles.messageTime}>
                            {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className={styles.inputArea}>
                <div className={styles.inputWrap}>
                  <input
                    ref={inputRef}
                    className={styles.input}
                    type="text"
                    placeholder="Écrire un message..."
                    value={input}
                    onChange={handleInputChange}
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
            </>
          ) : (
            <div className={styles.chatEmpty}>
              <div className={styles.chatEmptyIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <p>Choisissez un contact pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
