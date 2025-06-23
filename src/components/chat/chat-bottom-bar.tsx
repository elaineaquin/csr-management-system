'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SendHorizontal, ThumbsUp } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { EmojiPicker } from './emoji-picker';

interface ChatBottombarProps {
	sendMessage: (newMessage: string) => void;
}

export function ChatBottomBar({ sendMessage }: ChatBottombarProps) {
	const [message, setMessage] = useState('');
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(event.target.value);
	};

	const handleThumbsUp = () => {
		sendMessage('👍');
		setMessage('');
	};

	const handleSend = () => {
		if (message.trim()) {
			sendMessage(message);
			setMessage('');

			if (inputRef.current) {
				inputRef.current.focus();
			}
		}
	};

	const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}

		if (event.key === 'Enter' && event.shiftKey) {
			event.preventDefault();
			setMessage((prev) => prev + '\n');
		}
	};

	const handleEmojiSelect = (emoji: string) => {
		setMessage((prev) => prev + emoji);
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.style.height = 'auto';
			const newHeight = Math.min(inputRef.current.scrollHeight, 100);
			inputRef.current.style.height = `${newHeight}px`;
		}
	}, [message]);

	return (
		<div className="flex items-end gap-2 p-4 border-t bg-background">
			<div className="flex-1 relative">
				<div className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
					<Textarea
						ref={inputRef}
						autoComplete="off"
						value={message}
						onKeyDown={handleKeyPress}
						onChange={handleInputChange}
						name="message"
						placeholder="Type a message..."
						className={cn(
							'min-h-[44px] max-h-[100px] resize-none border-0 p-3 pr-12 shadow-none focus-visible:ring-0',
							'placeholder:text-muted-foreground',
						)}
						rows={1}
					/>
					<div className="absolute right-3 bottom-1">
						<EmojiPicker onChange={handleEmojiSelect} />
					</div>
				</div>
			</div>

			{message.trim() ? (
				<Button onClick={handleSend} size="icon" className="h-10 w-10 shrink-0">
					<SendHorizontal className="h-6 w-4" />
					<span className="sr-only">Send message</span>
				</Button>
			) : (
				<Button onClick={handleThumbsUp} variant="outline" size="icon" className="h-10 w-10 shrink-0">
					<ThumbsUp className="h-4 w-4" />
					<span className="sr-only">Send thumbs up</span>
				</Button>
			)}
		</div>
	);
}
