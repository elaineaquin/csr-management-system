'use client';

import { useGetDiscussionMessages, useSendMessage } from '@/hooks/use-discussion';
import { useSession } from '@/lib/auth-client';
import { getSocket, initiateSocket, joinDiscussionRoom } from '@/lib/socket-client';
import { cn, getFormattedDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { AvatarDisplay } from '../avatar-display';
import { MessageType } from '@/server/discussions';
import { ChatBottomBar } from './chat-bottom-bar';

export function ChatContainer({ roomId }: { roomId: string }) {
	useEffect(() => {
		initiateSocket(process.env.BETTER_AUTH_URL);
	}, []);

	useEffect(() => {
		joinDiscussionRoom(roomId);
	}, [roomId]);

	return <Chat roomId={roomId} />;
}

export function Chat({ roomId }: { roomId: string }) {
	const { data: session } = useSession();
	const { data: initialMessages, isLoading } = useGetDiscussionMessages({ roomId });
	const { mutateAsync: sendMessage } = useSendMessage();
	const [messages, setMessages] = useState<MessageType[]>([]);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (initialMessages) {
			setMessages(initialMessages);
		}
	}, [initialMessages]);

	useEffect(() => {
		const socket = getSocket();
		if (!socket) return;

		const handler = (message: MessageType) => {
			if (message) {
				setMessages((prev) => [...prev, message]);
			}
		};

		socket.on('message', handler);
		return () => {
			socket.off('message', handler);
		};
	}, []);

	useEffect(() => {
		const timeout = setTimeout(() => {
			if (messagesEndRef.current) {
				messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
			}
		}, 50);

		return () => clearTimeout(timeout);
	}, [messages]);

	const onHandleSendMessage = (content: string) => {
		if (content.trim()) {
			sendMessage({ roomId, content, userId: session?.user.id ?? '' });
		}
	};

	if (isLoading) return <div className="p-4 text-muted-foreground">Loading messages...</div>;

	return (
		<div className="flex flex-col h-full w-full">
			<div className="flex-1 overflow-y-auto pb-4">
				<ChatList messages={messages} bottomRef={messagesEndRef} />
			</div>
			<ChatBottomBar sendMessage={onHandleSendMessage} />
		</div>
	);
}

export function ChatList({
	messages,
	bottomRef,
}: {
	messages: MessageType[];
	bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
	const { data: session } = useSession();

	return (
		<div className="flex flex-col w-full space-y-2 px-4 pt-4">
			<AnimatePresence initial={false}>
				{messages.length === 0 ? (
					<div className="flex justify-center items-center py-4 text-muted-foreground text-sm">
						Start a great discussion now! ✨
					</div>
				) : (
					messages.map((message) => {
						const isOwnMessage = message.userId === session?.user.id;
						return (
							<motion.div
								key={message.id}
								layout
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 10 }}
								transition={{
									type: 'spring',
									bounce: 0.3,
									duration: 0.4,
								}}
								className={cn('flex items-end gap-2', isOwnMessage ? 'justify-end' : 'justify-start')}
							>
								{!isOwnMessage && (
									<AvatarDisplay
										name={message.user.name ?? 'User'}
										profilePicture={message.user.image ?? ''}
										size="small"
									/>
								)}
								<div className="flex flex-col">
									{!isOwnMessage && (
										<div className="text-xs font-medium text-muted-foreground mb-1 ml-1">{message.user.name}</div>
									)}
									<div className={cn('flex items-end gap-2', isOwnMessage ? 'flex-row-reverse' : 'flex-row')}>
										<div
											className={cn(
												'rounded-lg px-4 py-2 max-w-xs text-sm',
												isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
											)}
										>
											<span>{message.content}</span>
										</div>
										<span className="text-muted-foreground text-xs">{getFormattedDate(message.createdAt)}</span>
									</div>
								</div>
							</motion.div>
						);
					})
				)}
			</AnimatePresence>

			<div ref={bottomRef} />
		</div>
	);
}
