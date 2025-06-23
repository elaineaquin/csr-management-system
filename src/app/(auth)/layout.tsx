import Image from 'next/image';
import React from 'react';

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="h-screen flex p-4 overflow-hidden bg-gray-50 dark:bg-gray-950">
			<div className="flex flex-1 items-center px-4">
				<div className="w-full">
					<div className="mb-6 flex justify-center">
						<Image src={'/csrms-logo.png'} alt="LOGO" width={120} height={100} />
					</div>
					{children}
				</div>
			</div>
			<div className="flex-1 hidden lg:flex items-center justify-center overflow-hidden rounded-md">
				<div>
					<div className="flex justify-center">
						<div className="flex w-max items-center">
							<Square />
							<Square />
							<Square />
							<Square />
							<Square />
							<Square />
						</div>
					</div>
					<div className="flex justify-center">
						<div className="flex w-max items-center">
							<Square />
							<Square />
							<Square />
							<Square background="#2c2c2c">
								<Image src="/csrms-logo.png" alt="CSR Management System Logo" width="120" height="120" />
							</Square>
							<Square />
							<Square />
						</div>
					</div>
					<div className="flex justify-center">
						<div className="flex w-max items-center">
							<Square />
							<Square />
							<Square background="#FDB51B">
								<Image src="/csrms-logo.png" alt="CSR Management System Logo" width="100" height="100" />
							</Square>
							<Square />
							<Square />
							<Square />
						</div>
					</div>
					<div className="flex justify-center">
						<div className="flex w-max items-center">
							<Square />
							<Square />
							<Square />
							<Square />
							<Square />
							<Square />
						</div>
					</div>
					<div className="flex justify-center">
						<div className="flex w-max items-center">
							<Square />
							<Square />
							<Square />
							<Square />
							<Square />
							<Square />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function Square({ background, children }: Readonly<{ background?: string; children?: React.ReactNode }>) {
	return (
		<div
			style={{
				backgroundColor: background ?? 'transparent',
			}}
			className="w-[174px] h-[174px] border rounded-md border-dashed flex items-center justify-center border-gray-200 dark:border-gray-800 m-0"
		>
			{children}
		</div>
	);
}
