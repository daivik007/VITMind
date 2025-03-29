
import React, { useState } from 'react';
import { Send, PaperclipIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CircularButton from '@/components/ui/CircularButton';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isDisabled: boolean;
  messageLimit?: {
    remaining: number;
    maxMessages: number;
    onLogin: () => void;
  };
}

const MessageInput = ({ 
  onSendMessage, 
  isLoading, 
  isDisabled,
  messageLimit 
}: MessageInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || isDisabled) return;
    
    onSendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="pt-4 border-t border-border/60">
      {messageLimit && (
        <div className="mb-2 text-xs text-amber-400 font-medium">
          Guest mode: {messageLimit.remaining} {messageLimit.remaining === 1 ? 'message' : 'messages'} remaining. 
          <Button 
            variant="link" 
            className="p-0 h-auto text-xs text-primary" 
            onClick={messageLimit.onLogin}
          >
            Sign in
          </Button> to continue.
        </div>
      )}

      <form 
        onSubmit={handleSubmit}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 input-field"
          disabled={isLoading || isDisabled}
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-10 w-10"
          disabled={isLoading}
        >
          <PaperclipIcon className="h-4 w-4" />
        </Button>
        <CircularButton 
          type="submit" 
          variant="primary"
          disabled={!inputValue.trim() || isLoading || isDisabled}
        >
          <Send className="h-5 w-5" />
        </CircularButton>
      </form>
      
    </div>
  );
};

export default MessageInput;
