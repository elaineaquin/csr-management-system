'use client';

import { AccessGuard } from '@/components/access-guard';
import { Loading } from '@/components/loading';
import { PageActions, PageHeader, PageHeaderHeading } from '@/components/page-header';
import { SectionWrapper } from '@/components/section-wrapper';
import { Button } from '@/components/ui/button';
import { useGetDocuments, useGetFolderPermission } from '@/hooks/use-document';
import { ArrowLeftIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { DataTable } from './_components/data-table';
import { columns } from './_components/columns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect } from 'react';

export default function Page() {
	const { id } = useParams();
	const router = useRouter();

	const { data: folder, isLoading } = useGetDocuments({ id: id as string });

	const { data: canView, isLoading: loadingPermission } = useGetFolderPermission({
		folderId: id as string,
		permissions: 'READ',
	});

	const { data: canEdit } = useGetFolderPermission({ folderId: id as string, permissions: 'WRITE' });

	useEffect(() => {
		if (!loadingPermission && canView === false) {
			router.replace('/unauthorized');
		}
	}, [loadingPermission, canView, router]);

	if (isLoading || loadingPermission || !folder || canView === false) {
		return <Loading />;
	}

	return (
		<AccessGuard page="document">
			<PageHeader>
				<Button variant={'ghost'} size={'icon'} className="mr-2" onClick={() => router.back()}>
					<ArrowLeftIcon />
				</Button>
				<div className="w-full">
					<PageHeaderHeading>{folder.title}</PageHeaderHeading>
				</div>
				{canEdit && (
					<PageActions>
						<Button onClick={() => router.push(`/document/${id}/new`)}>Add Document</Button>
					</PageActions>
				)}
			</PageHeader>
			<Tabs defaultValue="file" className="gap-0">
				<SectionWrapper>
					<TabsList>
						<TabsTrigger value="file">Files</TabsTrigger>
						<TabsTrigger value="archived">Archived</TabsTrigger>
					</TabsList>
				</SectionWrapper>
				<SectionWrapper>
					<TabsContent value="file">
						<DataTable columns={columns} data={folder.documents.filter((doc) => !doc.archived)} />
					</TabsContent>
					<TabsContent value="archived">
						<DataTable columns={columns} data={folder.documents.filter((doc) => doc.archived)} />
					</TabsContent>
				</SectionWrapper>
			</Tabs>
		</AccessGuard>
	);
}
