'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateVolunterAvailability } from '@/hooks/use-volunteer';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type EditAvailabilityDialogProps = {
	volunteerId: string;
	initialAvailability: string[];
	onSave: () => Promise<void>;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function EditAvailabilityDialog({
	volunteerId,
	initialAvailability = [],
	onSave,
	open,
	onOpenChange,
}: EditAvailabilityDialogProps) {
	const [availability, setAvailability] = useState<string[]>(initialAvailability);
	const [isLoading, setIsLoading] = useState(false);
	const { mutateAsync: updateAvailability } = useUpdateVolunterAvailability();

	// Reset to initial state when dialog opens
	useEffect(() => {
		if (open) {
			setAvailability([...initialAvailability]);
		}
	}, [open, initialAvailability]);

	const handleAddDay = (day: string) => {
		setAvailability((prev) => [...prev, day]);
	};

	const handleRemoveDay = (day: string) => {
		setAvailability((prev) => prev.filter((d) => d !== day));
	};

	const handleSave = async () => {
		setIsLoading(true);
		try {
			await updateAvailability({ volunteerId, days: availability });
			await onSave();
			toast.success('Availability updated', {
				description: 'Your availability has been successfully updated.',
			});
			onOpenChange(false);
		} catch {
			toast.error('Error', {
				description: 'Failed to update availability. Please try again.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		onOpenChange(false);
	};

	// Get available days (days not in current availability)
	const availableDays = daysOfWeek.filter((day) => !availability.includes(day));

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Availability</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<h4 className="text-sm font-medium mb-2">Current Availability</h4>
						<div className="flex flex-wrap gap-2">
							{availability.length > 0 ? (
								availability.map((day) => (
									<Button key={day} variant="outline" size="sm" onClick={() => handleRemoveDay(day)}>
										<Calendar className="w-4 h-4 mr-2" />
										<span>{day}</span>
										<XIcon className="h-3 w-3 ml-2" />
									</Button>
								))
							) : (
								<span className="text-sm text-muted-foreground">No days selected</span>
							)}
						</div>
					</div>

					<div>
						<h4 className="text-sm font-medium mb-2">Available Days</h4>
						<div className="flex flex-wrap gap-2">
							{availableDays.length > 0 ? (
								availableDays.map((day) => (
									<Button
										key={day}
										variant="outline"
										size="sm"
										onClick={() => handleAddDay(day)}
										disabled={availability.includes(day)}
									>
										<Calendar className="w-4 h-4 mr-2" />
										<span>{day}</span>
									</Button>
								))
							) : (
								<span className="text-sm text-muted-foreground">All days selected</span>
							)}
						</div>
					</div>

					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={handleCancel} disabled={isLoading}>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								'Save Changes'
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
