import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AvatarDisplayProps {
	profilePicture?: string;
	name: string;
	size: 'small' | 'medium' | 'large';
	className?: string; // Optional className prop
}

const sizeStyles = {
	small: 'w-6 h-6',
	medium: 'w-10 h-10',
	large: 'w-16 h-16',
};

export const AvatarDisplay = ({ profilePicture, name, size, className = '' }: AvatarDisplayProps) => {
	const sizeClass = sizeStyles[size];

	return (
		<Avatar className={`${sizeClass} ${className}`}>
			<AvatarImage
				src={profilePicture}
				alt={name}
				className="object-cover"
				width={size === 'small' ? 24 : size === 'medium' ? 40 : 64}
				height={size === 'small' ? 24 : size === 'medium' ? 40 : 64}
			/>
			<AvatarFallback className="items-center flex">
				{name
					.split(' ')
					.map((word) => word[0])
					.join('')}
			</AvatarFallback>
		</Avatar>
	);
};
