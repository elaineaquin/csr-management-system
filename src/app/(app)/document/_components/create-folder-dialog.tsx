'use client';

import type React from 'react';

import { useState } from 'react';
import { ButtonGuard } from '@/components/button-guard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CirclePlusIcon } from 'lucide-react';
import { useCreateFolder } from '@/hooks/use-document';

export function CreateFolderDialog() {
	const { mutateAsync: createNewFolder } = useCreateFolder();
	const [open, setOpen] = useState(false);
	const [folderName, setFolderName] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!folderName.trim()) return;

		setIsLoading(true);

		try {
			await createNewFolder({ name: folderName });
			setFolderName('');
			setOpen(false);
		} catch (error) {
			console.error('Failed to create folder:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setFolderName('');
		setOpen(false);
	};

	return (
		<ButtonGuard name="document" actions={['create']}>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button>
						<CirclePlusIcon className="w-4 h-4 mr-2" />
						Create a folder
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Create New Folder</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="folder-name">Folder Name</Label>
							<Input
								id="folder-name"
								placeholder="Enter folder name"
								value={folderName}
								onChange={(e) => setFolderName(e.target.value)}
								disabled={isLoading}
								autoFocus
							/>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
								Cancel
							</Button>
							<Button type="submit" disabled={!folderName.trim() || isLoading}>
								{isLoading ? 'Creating...' : 'Create Folder'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</ButtonGuard>
	);
}
