import { Router, Request, Response } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { Message } from "../../models/message.model";
import { User } from "../../models/user.model";

const router = Router();

router.get("/contacts", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const sentMessages = await Message.find({ sender: userId }).distinct("receiver");
    const receivedMessages = await Message.find({ receiver: userId }).distinct("sender");

    const contactIds = [
      ...new Set([...sentMessages.map(String), ...receivedMessages.map(String)]),
    ].filter((id) => id !== userId);

    const contacts = await User.find({ _id: { $in: contactIds } })
      .select("firstName lastName role avatar")
      .lean();

    const contactsWithUnread = await Promise.all(
      contacts.map(async (contact) => {
        const unreadCount = await Message.countDocuments({
          sender: contact._id,
          receiver: userId,
          read: false,
        });
        const lastMessage = await Message.findOne({
          $or: [
            { sender: userId, receiver: contact._id },
            { sender: contact._id, receiver: userId },
          ],
        })
          .sort({ createdAt: -1 })
          .lean();

        return { ...contact, unreadCount, lastMessage };
      })
    );

    contactsWithUnread.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
    });

    res.json(contactsWithUnread);
  } catch (err) {
    console.error("[MESSAGING] Error fetching contacts:", err);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

router.get("/messages/:contactId", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { contactId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: contactId },
        { sender: contactId, receiver: userId },
      ],
    })
      .populate("sender", "firstName lastName role avatar")
      .populate("receiver", "firstName lastName role avatar")
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (err) {
    console.error("[MESSAGING] Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.get("/search-users", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const query = req.query.q as string;

    if (!query?.trim()) {
      return res.json([]);
    }

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("firstName lastName role avatar")
      .limit(10)
      .lean();

    res.json(users);
  } catch (err) {
    console.error("[MESSAGING] Error searching users:", err);
    res.status(500).json({ error: "Failed to search users" });
  }
});

export default router;
