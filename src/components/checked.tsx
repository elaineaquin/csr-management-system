import { cn } from '@/lib/utils';
import { CircleCheckBigIcon } from 'lucide-react';
import { motion } from 'motion/react';

const successIconVariants = {
	initial: { scale: 0, rotate: -180 },
	animate: {
		scale: 1,
		rotate: 0,
		transition: {
			type: 'spring',
			stiffness: 200,
			damping: 20,
		},
	},
};

export default function Checked({ className }: { className?: string }) {
	return (
		<motion.div
			variants={successIconVariants}
			initial="initial"
			animate="animate"
			className={cn(
				'flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900',
				className,
			)}
		>
			<CircleCheckBigIcon className="h-6 w-6  text-green-500 dark:text-green-400" />
		</motion.div>
	);
}
