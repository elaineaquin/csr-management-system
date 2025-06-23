'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getTypeLabel, formatBytes } from '@/lib/utils';
import { Attachment } from '@prisma/client';
import { AlertCircle, CheckCircle, UploadIcon, XIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useUpload } from '@/hooks/use-upload';
import Image from 'next/image';

type UploadStatus = 'idle' | 'dragging' | 'uploading' | 'success' | 'error' | 'wait';

const cardVariants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 },
};

const dropzoneVariants = {
	idle: {
		scale: 1,
		borderColor: 'var(--dropzone-border)',
		backgroundColor: 'var(--dropzone-bg)',
	},
	dragging: {
		scale: 1.02,
		borderColor: 'var(--dropzone-border-active)',
		backgroundColor: 'var(--dropzone-bg-active)',
		transition: {
			type: 'spring',
			stiffness: 400,
			damping: 25,
		},
	},
};

const iconVariants = {
	idle: { y: 0, scale: 1 },
	dragging: {
		y: -5,
		scale: 1.1,
		transition: {
			repeat: Number.POSITIVE_INFINITY,
			repeatType: 'reverse' as const,
			duration: 1,
			ease: 'easeInOut',
		},
	},
};

const progressVariants = {
	initial: { pathLength: 0, opacity: 0 },
	animate: (progress: number) => ({
		pathLength: progress / 100,
		opacity: 1,
		transition: { duration: 0.5, ease: 'easeOut' },
	}),
};

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

interface FileUploaderProps {
	currentFile?: File | null;
	acceptedFileTypes?: string[];
	maxFileSize?: number;
	onFileRemove?: () => void;
	onUploadError?: (error: string) => void;
	onUploadSuccess?: (file: Attachment) => void;
}

export const FileUploader = forwardRef(function FileUploader(
	{ acceptedFileTypes, onUploadError, onUploadSuccess, maxFileSize, onFileRemove }: FileUploaderProps,
	ref: React.Ref<{ startUpload: () => Promise<string | null> }>,
) {
	// states
	const [file, setFile] = useState<File | null>(null);
	const [status, setStatus] = useState<UploadStatus>('idle');
	const [error, setError] = useState<string | null>(null);
	const [progress, setProgress] = useState<number>(0);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	// hooks
	const fileInputRef = useRef<HTMLInputElement>(null);
	useImperativeHandle(ref, () => ({
		startUpload: async () => await startUpload(),
	}));
	const { mutateAsync: uploadFileAsync } = useUpload(setProgress);

	// should return the fucking document id.
	const startUpload = async () => {
		if (!file) return null;
		setStatus('uploading');
		setProgress(0);
		setError(null);
		try {
			const result = await uploadFileAsync(file);
			if (result) {
				setProgress(100);
				setStatus('success');
				onUploadSuccess?.(result);
			}
			return result?.id || null;
		} catch (error) {
			setError(error as string);
			setStatus('error');
			if (onUploadError) onUploadError(error as string);
			return null;
		}
	};

	const handleFileValidation = useCallback(
		(selectedFile: File): boolean => {
			setError(null);
			if (!selectedFile) return false;

			if (acceptedFileTypes && !acceptedFileTypes.includes(selectedFile.type)) {
				const errorMessage = `Invalid file type. Accepted: ${acceptedFileTypes
					.map((type) => getTypeLabel(type))
					.join(', ')}`;
				setError(errorMessage);
				setStatus('error');
				if (onUploadError) onUploadError(errorMessage);
				return false;
			}

			if (maxFileSize && selectedFile.size > maxFileSize) {
				const errorMessage = `File size exceeds the maximum limit of ${maxFileSize} bytes`;
				setError(errorMessage);
				setStatus('error');
				if (onUploadError) onUploadError(errorMessage);
				return false;
			}

			return true;
		},
		[acceptedFileTypes, maxFileSize, setError, setStatus, onUploadError],
	);

	const handleFileSelect = useCallback(
		(selectedFile: File | null) => {
			if (!selectedFile) return;

			if (!handleFileValidation(selectedFile)) {
				setFile(null);
				return;
			}

			setFile(selectedFile);
			setError(null);
			// set to wait state because the file will be uploaded separately
			setStatus('wait');
			setProgress(0);
		},
		[handleFileValidation, setFile, setError, setStatus, setProgress],
	);

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		handleFileSelect(selectedFile || null);
		if (e.target) e.target.value = '';
	};

	const resetState = () => {
		setFile(null);
		setStatus('idle');
		setError(null);
		setProgress(0);
		setPreviewUrl(null);
	};

	const handleRemoveFile = useCallback(() => {
		resetState(); // does the same as the resetState function
		onFileRemove?.();
	}, [onFileRemove]);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			if (status === 'uploading' || status === 'success') return; // Don't allow drop during/after upload

			setStatus('idle');
			const droppedFile = e.dataTransfer.files?.[0];
			if (droppedFile) {
				handleFileSelect(droppedFile);
			}
		},
		[status, handleFileSelect],
	);

	const handleDragLeave = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			if (status === 'dragging') setStatus('idle');
		},
		[status],
	);

	const handleDragOver = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			if (status !== 'dragging' && status !== 'success') setStatus('dragging');
		},
		[status],
	);

	const triggerFileInput = () => {
		if (status === 'uploading' || status === 'success') return; // Prevent opening dialog when not idle/error
		fileInputRef.current?.click();
	};

	useEffect(() => {
		if (file?.type?.startsWith('image/')) {
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
			return () => URL.revokeObjectURL(url);
		}
		return () => setPreviewUrl(null);
	}, [file]);

	return (
		<motion.div
			variants={cardVariants}
			initial="initial"
			animate="animate"
			exit="exit"
			className="relative"
			style={
				{
					'--border-color': 'rgb(var(--zinc-200) / 0.5)',
					'--bg-color': 'rgb(var(--zinc-50) / 0.3)',
					'--primary-color': 'rgb(var(--violet-500))',
					'--primary-bg': 'rgb(var(--violet-50) / 0.2)',
				} as React.CSSProperties
			}
		>
			<input
				ref={fileInputRef}
				type="file"
				className="sr-only"
				onChange={handleFileInputChange}
				accept={acceptedFileTypes?.join(',')}
			/>
			<AnimatePresence mode="wait">
				{status === 'success' && file ? (
					<motion.div
						key="success"
						variants={cardVariants}
						initial="initial"
						animate="animate"
						exit="exit"
						className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<motion.div
									variants={successIconVariants}
									initial="initial"
									animate="animate"
									className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
								>
									<CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
								</motion.div>
								<div>
									<h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Upload complete</h3>
									<p className="text-xs text-zinc-500 dark:text-zinc-400">{file.name}</p>
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleRemoveFile}
								className="h-8 w-8 rounded-full p-0 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
							>
								<XIcon className="h-4 w-4" />
								<span className="sr-only">Remove file</span>
							</Button>
						</div>

						{previewUrl && (
							<div className="mt-3 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
								<Image
									src={previewUrl || '/placeholder.svg'}
									alt={file.name}
									width={400}
									height={300}
									className="h-auto max-h-48 w-full object-contain"
								/>
							</div>
						)}
					</motion.div>
				) : status === 'wait' && file ? (
					<motion.div
						key="wait"
						variants={cardVariants}
						initial="initial"
						animate="animate"
						exit="exit"
						className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
									<UploadIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
								</div>
								<div>
									<h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">File selected</h3>
									<p className="text-xs text-zinc-500 dark:text-zinc-400">
										{file.name} ({formatBytes(file.size)})
									</p>
								</div>
							</div>
							<div className="flex space-x-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleRemoveFile}
									className="h-8 w-8 rounded-full p-0 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
								>
									<XIcon className="h-4 w-4" />
									<span className="sr-only">Remove file</span>
								</Button>
							</div>
						</div>

						{previewUrl && (
							<div className="mt-3 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
								<Image
									src={previewUrl || '/placeholder.svg'}
									alt={file.name}
									width={400}
									height={300}
									className="h-auto max-h-48 w-full object-contain"
								/>
							</div>
						)}
					</motion.div>
				) : status === 'error' ? (
					<motion.div
						key="error"
						variants={cardVariants}
						initial="initial"
						animate="animate"
						exit="exit"
						className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-400 dark:bg-red-950"
					>
						<div className="flex items-start space-x-3">
							<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
								<AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
							</div>
							<div className="flex-1">
								<h3 className="text-sm font-medium text-red-800 dark:text-red-300">Upload failed</h3>
								<p className="mt-1 text-xs text-red-700 dark:text-red-400">{error}</p>
								<Button
									variant="outline"
									size="sm"
									onClick={resetState}
									className="mt-2 border-red-300 bg-white text-red-700 hover:bg-red-50 dark:border-red-500 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950"
								>
									Try again
								</Button>
							</div>
						</div>
					</motion.div>
				) : status === 'uploading' ? (
					<motion.div
						key="uploading"
						variants={cardVariants}
						initial="initial"
						animate="animate"
						exit="exit"
						className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
					>
						<div className="flex items-center space-x-3">
							<div className="relative h-10 w-10 flex-shrink-0">
								<svg className="h-10 w-10" viewBox="0 0 36 36">
									<motion.path
										d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
										fill="none"
										stroke="#E2E8F0"
										strokeWidth="2"
										strokeLinecap="round"
									/>
									<motion.path
										d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
										fill="none"
										stroke="#8B5CF6"
										strokeWidth="2"
										strokeLinecap="round"
										initial="initial"
										animate="animate"
										variants={progressVariants}
										custom={progress}
									/>
								</svg>
								<div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-zinc-700 dark:text-zinc-300">
									{Math.round(progress)}%
								</div>
							</div>
							<div>
								<h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Uploading...</h3>
								{file && <p className="text-xs text-zinc-500 dark:text-zinc-400">{file.name}</p>}
							</div>
						</div>
					</motion.div>
				) : (
					<motion.div
						key="dropzone"
						variants={dropzoneVariants}
						animate={status}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={triggerFileInput}
						className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 transition-colors hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
					>
						<motion.div
							variants={iconVariants}
							animate={status}
							className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950"
						>
							<UploadIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
						</motion.div>
						<h3 className="mb-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
							{status === 'dragging' ? 'Drop to upload' : 'Upload a file'}
						</h3>
						<p className="mb-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
							Drag and drop or click to browse
							{acceptedFileTypes && acceptedFileTypes.length > 0 && (
								<>
									<br />
									Accepted formats: {acceptedFileTypes.map((type) => getTypeLabel(type)).join(', ')}
								</>
							)}
							{maxFileSize && (
								<>
									<br />
									Max size: {formatBytes(maxFileSize)}
								</>
							)}
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
});
