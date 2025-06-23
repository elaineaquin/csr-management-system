import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
	return (
		<>
			<header className="border-grid border-b h-14 flex shrink-0 sticky top-0 z-50 w-full transition-all bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container-wrapper flex items-center">
					<div className="container flex flex-1 items-center gap-2 px-3">
						<Button variant={'link'} asChild>
							<Link href={siteConfig.url} className="flex items-center gap-2 text-xl font-bold text-primary">
								<Image src={'/csrms-logo.png'} alt="LOGO" width={32} height={32} className="h-8 w-8" />
								<span>{siteConfig.name} Management System</span>
							</Link>
						</Button>

						<div className="ml-auto flex gap-4">
							<Button variant={'outline'} asChild>
								<Link href={'/sign-in'}>Log In</Link>
							</Button>
							<Button variant={'default'}>
								<Link href={'/sign-up'}>Sign Up</Link>
							</Button>
						</div>
					</div>
				</div>
			</header>
			<main className="border-grid border-b">
				<div className="border-grid border-b">
					<div className="container-wrapper">
						<div className="container flex flex-col items-start gap-1 py-8 md:py-10 lg:py-12">
							<h1
								className={'text-2xl font-bold leading-tight tracking-tighter sm:text-3xl md:text-4xl lg:leading-[1.1]'}
							>
								Sample Landing Page
							</h1>
							<p className="max-w-2xl text-balance text-base font-light text-foreground sm:text-lg">
								Sample Landing Page and add descriptions with UI/UX
							</p>
							<div className="flex w-full items-center justify-start gap-2 pt-2">
								<Button size={'sm'} asChild>
									<Link href={'/sign-up'}>Sign Up</Link>
								</Button>
								<Button size={'sm'} variant={'ghost'} asChild>
									<Link href={'#'}>Contact Devs</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
				<div className="container-wrapper">
					<div className="container py-4">
						<Card></Card>
					</div>
				</div>
			</main>
		</>
	);
}
