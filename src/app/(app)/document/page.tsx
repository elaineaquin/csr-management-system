import { AccessGuard } from '@/components/access-guard';
import { PageHeaderDescription } from '@/components/page-header';
import { PageActions, PageHeaderHeading } from '@/components/page-header';
import { PageHeader } from '@/components/page-header';
import { SectionWrapper } from '@/components/section-wrapper';
import { DataTable } from './_components/data-table';
import { columns } from './_components/columns';
import { CreateFolderDialog } from './_components/create-folder-dialog';

export default function DocumentPage() {
	return (
		<AccessGuard page="document">
			<PageHeader>
				<div>
					<PageHeaderHeading>Document Repository</PageHeaderHeading>
					<PageHeaderDescription>Manage and access CSR-related documents</PageHeaderDescription>
				</div>
				<PageActions>
					<CreateFolderDialog />
				</PageActions>
			</PageHeader>
			<SectionWrapper>
				<DataTable columns={columns} />
			</SectionWrapper>
		</AccessGuard>
	);
}
