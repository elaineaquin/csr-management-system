export const siteConfig = {
	name: 'CSRMS',
	description: '',
	url: 'http://localhost:3000',
};

export type SiteConfig = typeof siteConfig;

export const preferredUploadService: 'localStorage' | 'cloudinaryStorage' = 'cloudinaryStorage';
