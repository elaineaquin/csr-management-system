'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SmileIcon } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

interface EmojiPickerProps {
	onChange: (value: string) => void;
}

export const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
	return (
		<Popover>
			<PopoverTrigger>
				<SmileIcon className="text-muted-foreground hover:text-foreground transition" />
			</PopoverTrigger>
			<PopoverContent className="w-full">
				<Picker
					emojiSize={18}
					theme="light"
					data={data}
					maxFrequentRows={1}
					onEmojiSelect={(emoji: { native: string }) => onChange(emoji.native)}
				/>
			</PopoverContent>
		</Popover>
	);
};
