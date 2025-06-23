declare namespace NodeJS {
	interface ProcessEnv {
		DATABASE_URL: string;
		BETTER_AUTH_SECRET: string;
		BETTER_AUTH_URL: string;
		GITHUB_CLIENT_ID: string;
		GITHUB_CLIENT_SECRET: string;
		GOOGLE_CLIENT_ID: string;
		GOOGLE_CLIENT_SECRET: string;
		MICROSOFT_CLIENT_ID: string;
		MICROSOFT_CLIENT_SECRET: string;
		EMAIL_USER: string;
		EMAIL_PASS: string;
		EMAIL_VERIFICATION_CALLBACK_URL: string;
		CLOUDINARY_CLOUDNAME: string;
		CLOUDINARY_API_SECRET: string;
		CLOUDINARY_API_KEY: string;
		CLOUDINARY_URL: string;
		AES_SECRET_KEY: string;
		PROJECT_NAME: string;
		COHERE_API_KEY: string;
		OPENAI_API_KEY: string;
	}
}
