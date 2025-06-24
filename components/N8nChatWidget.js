import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

const N8nChatWidget = () => {
  useEffect(() => {
    createChat({
      webhookUrl: 'https://bilincli.app.n8n.cloud/webhook/d34b7aee-31d8-4139-80cb-7eee6b913f09/chat',
      mode: 'window',
      showWelcomeScreen: true,
      defaultLanguage: 'en',
      initialMessages: [
        'Hi there! 👋',
        'How can I help you with your startup ideas?'
      ],
      i18n: {
        en: {
          title: 'AI Assistant 👋',
          subtitle: "I'm here to help you with your startup ideas!",
          footer: '',
          getStarted: 'New Conversation',
          inputPlaceholder: 'Type your message...',
        },
      },
    });
  }, []);

  return <div id="n8n-chat"></div>;
};

export default N8nChatWidget; 