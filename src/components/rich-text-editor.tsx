'use client';

import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { EditorContent, useEditor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { Skeleton } from './ui/skeleton';
import {
	AlignCenterIcon,
	AlignLeftIcon,
	AlignRightIcon,
	BoldIcon,
	Heading1Icon,
	Heading2Icon,
	Heading3Icon,
	ItalicIcon,
	ListIcon,
	ListOrderedIcon,
	Redo2Icon,
	StrikethroughIcon,
	UnderlineIcon,
	Undo2Icon,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { Toggle } from './ui/toggle';

interface RichTextEditorProps {
	placeholder?: string;
	onChange?: (html: string) => void;
	value?: string;
	className?: string;
}

export function RichTextEditor({ value, onChange, className, placeholder }: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				bulletList: {
					HTMLAttributes: {
						class: 'list-disc ml-3',
					},
				},
				orderedList: {
					HTMLAttributes: {
						class: 'list-decimal ml-3',
					},
				},
			}),
			Underline,
			TextAlign.configure({
				types: ['heading', 'paragraph'],
			}),
		],
		content: value,
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			onChange?.(html);
		},
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class: cn(
					'w-full border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
					className,
				),
			},
		},
	});
	useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value!);
		}
	}, [editor, value]);

	if (!editor) {
		return <Skeleton className={'min-h-[150px] w-full rounded-md border border-input'} />;
	}

	const Styles = [
		{
			icon: BoldIcon,
			label: 'Bold',
			onClick: () => editor?.chain().focus().toggleBold().run(),
			pressed: editor.isActive('bold'),
		},
		{
			icon: ItalicIcon,
			label: 'Italic',
			onClick: () => editor?.chain().focus().toggleItalic().run(),
			pressed: editor.isActive('italic'),
		},
		{
			icon: UnderlineIcon,
			label: 'Underline',
			onClick: () => editor?.chain().focus().toggleUnderline().run(),
			pressed: editor.isActive('underline'),
		},
		{
			icon: StrikethroughIcon,
			label: 'Strikethrough',
			onClick: () => editor.chain().focus().toggleStrike().run(),
			pressed: editor.isActive('strike'),
		},
	];

	const Headings = [
		{
			icon: Heading1Icon,
			label: 'Heading 1',
			onClick: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
			pressed: editor.isActive('heading', { level: 1 }),
		},
		{
			icon: Heading2Icon,
			label: 'Heading 2',
			onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
			pressed: editor.isActive('heading', { level: 2 }),
		},
		{
			icon: Heading3Icon,
			label: 'Heading 3',
			onClick: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
			pressed: editor.isActive('heading', { level: 3 }),
		},
	];

	const AlignmentsMenu = [
		{
			icon: AlignLeftIcon,
			label: 'Align Left',
			onClick: () => editor.chain().focus().setTextAlign('left').run(),
			pressed: editor.isActive({ textAlign: 'left' }),
		},
		{
			icon: AlignCenterIcon,
			label: 'Align Center',
			onClick: () => editor.chain().focus().setTextAlign('center').run(),
			pressed: editor.isActive({ textAlign: 'center' }),
		},
		{
			icon: AlignRightIcon,
			label: 'Align Right',
			onClick: () => editor.chain().focus().setTextAlign('right').run(),
			pressed: editor.isActive({ textAlign: 'right' }),
		},
	];

	const ListStlyes = [
		{
			icon: ListIcon,
			label: 'Bullet List',
			onClick: () => editor.chain().focus().toggleBulletList().run(),
			pressed: editor.isActive('bulletList'),
		},
		{
			icon: ListOrderedIcon,
			label: 'Ordered List',
			onClick: () => editor.chain().focus().toggleOrderedList().run(),
			pressed: editor.isActive('orderedList'),
		},
	];

	const undo = () => {
		editor?.chain().focus().undo().run();
	};

	const redo = () => {
		editor?.chain().focus().redo().run();
	};

	return (
		<div className="space-y-2">
			{' '}
			<div className="flex flex-wrap gap-1 p-1 border rounded-md bg-muted/20">
				<div className="border-r space-x-1 pr-1">
					{Headings.map((heading, index) => (
						<TooltipProvider key={index}>
							<Tooltip delayDuration={500}>
								<TooltipTrigger asChild>
									<Toggle onPressedChange={heading.onClick} pressed={heading.pressed}>
										<heading.icon className="w-4 h-4" />
										<span className="sr-only">{heading.label}</span>
									</Toggle>
								</TooltipTrigger>
								<TooltipContent>{heading.label}</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					))}
				</div>
				<div className="border-r space-x-1 pr-1">
					{Styles.map((style, index) => (
						<TooltipProvider key={index}>
							<Tooltip delayDuration={500}>
								<TooltipTrigger asChild>
									<Toggle onPressedChange={style.onClick} pressed={style.pressed}>
										<style.icon className="w-4 h-4" />
										<span className="sr-only">{style.label}</span>
									</Toggle>
								</TooltipTrigger>
								<TooltipContent>{style.label}</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					))}
				</div>
				<div className="border-r space-x-1 pr-1">
					{AlignmentsMenu.map((alignment, index) => (
						<TooltipProvider key={index}>
							<Tooltip delayDuration={500}>
								<TooltipTrigger asChild>
									<Toggle onPressedChange={alignment.onClick} pressed={alignment.pressed}>
										<alignment.icon className="w-4 h-4" />
										<span className="sr-only">{alignment.label}</span>
									</Toggle>
								</TooltipTrigger>
								<TooltipContent>{alignment.label}</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					))}
				</div>
				<div className="border-r space-x-1 pr-1">
					{ListStlyes.map((list, index) => (
						<TooltipProvider key={index}>
							<Tooltip delayDuration={500}>
								<TooltipTrigger asChild>
									<Toggle onPressedChange={list.onClick} pressed={list.pressed}>
										<list.icon className="w-4 h-4" />
										<span className="sr-only">{list.label}</span>
									</Toggle>
								</TooltipTrigger>
								<TooltipContent>{list.label}</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					))}
				</div>
				<div className="space-x-1 pr-1 ml-auto">
					<TooltipProvider>
						<Tooltip delayDuration={500}>
							<TooltipTrigger asChild>
								<Button onClick={() => undo()} variant={'ghost'}>
									<Undo2Icon className="w-4 h-4" />
									<span className="sr-only">Undo</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Undo</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<TooltipProvider>
						<Tooltip delayDuration={500}>
							<TooltipTrigger asChild>
								<Button onClick={() => redo()} variant={'ghost'}>
									<Redo2Icon className="w-4 h-4" />
									<span className="sr-only">Redo</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Redo</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>
			<EditorContent editor={editor} placeholder={placeholder} />
		</div>
	);
}
