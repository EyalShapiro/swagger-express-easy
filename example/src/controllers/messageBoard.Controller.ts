import { Request, Response } from 'express';
import ERROR_MSG from '../constant/error_msg';

type MessagesTypes = {
  id: number | string;
  text: string;
  time: string;
  useName: string;
  title: string;
};

// memory only
const messages = new Map<MessagesTypes['id'], MessagesTypes>();
export const getSizeMessages = (_req: Request, res: Response) => {
  res.json({ count: messages.size, messages });
};

export const addMessage = (req: Request, res: Response) => {
  try {
    const { text, title, useName } = req.body as Pick<MessagesTypes, 'text' | 'useName' | 'title'>;
    if (!useName) return res.status(400).json({ error: 'useName is required' });

    const newMessage = {
      id: messages.size + 1,
      time: new Date().toISOString(),
      text: text || '',
      useName: useName,
      title: title || '',
    };
    messages.set(newMessage.id, newMessage);
    res.status(201).json({ added: true, message: newMessage });
  } catch (error) {
    console.error('Error adding message:', error);

    res.status(500).json({ message: ERROR_MSG.internal, statusCode: 500, error });
  }
};

export const clearMessages = (_req: Request, res: Response) => {
  messages.clear();
  res.status(200).json({ cleared: true, message: 'clear the messages!' });
};
