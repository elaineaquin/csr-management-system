import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { FormItem } from './ui/form';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { DocumentRepository, AttachedDocument } from '@/types/document.type';

export function AddDocumentDialog({
	documents,
	existingDocuments,
	selectedDocs,
	setSelectedDocs,
	searchQuery,
	setSearchQuery,
	onHandleAddDocument,
}: {
	documents: DocumentRepository[];
	existingDocuments: AttachedDocument[];
	selectedDocs: string[];
	setSelectedDocs: (docs: string[]) => void;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	onHandleAddDocument: () => void;
}) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" className="mt-4">
					Add Document
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Document</DialogTitle>
					<DialogDescription>Select a document from the repository to add to this project.</DialogDescription>
				</DialogHeader>
				<Input
					type="text"
					placeholder="Search documents..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				<ScrollArea className="max-h-[500px]">
					{documents
						?.filter((doc) => !existingDocuments.find((d) => d.id === doc.id))
						.map((doc) => (
							<FormItem key={doc.id} className="flex items-center gap-2 p-2">
								<Checkbox
									id={doc.id}
									checked={selectedDocs.includes(doc.id)}
									onCheckedChange={(checked) => {
										if (checked) {
											setSelectedDocs([...selectedDocs, doc.id]);
										} else {
											setSelectedDocs(selectedDocs.filter((id) => id !== doc.id));
										}
									}}
									className="h-4 w-4"
								/>
								<Label htmlFor={doc.id} className="flex-1 cursor-pointer">
									{doc.title}
								</Label>
							</FormItem>
						))}
				</ScrollArea>
				<DialogFooter>
					<Button onClick={onHandleAddDocument}>Add Selected Document</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
