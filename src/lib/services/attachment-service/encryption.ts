import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { readFile, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { basename, join } from 'path';

export interface Encryption {
	/**
	 * Encrypts the given pathname string.
	 * @param pathname pathname to encrypt
	 */
	encrypt(pathname: string): Promise<string>;

	/**
	 * Decrypts the given encrypted pathname string.
	 * @param pathname pathname to decrypt
	 */
	decrypt(pathname: string): Promise<string>;
}

export class AesEncryption implements Encryption {
	private key: Buffer;
	constructor(secretKey: string) {
		this.key = Buffer.from(secretKey, 'hex');
		if (this.key.length !== 32) {
			throw new Error('Secret key must have 32 bytes (64 hex characters)');
		}
	}

	async encrypt(pathname: string): Promise<string> {
		const fileBufer = await readFile(pathname);
		const iv = randomBytes(12); // 12 bytes is recommended for GCM

		const cipher = createCipheriv('aes-256-gcm', this.key, iv);
		const encrypted = Buffer.concat([cipher.update(fileBufer), cipher.final()]);
		const authTag = cipher.getAuthTag();

		const combined = Buffer.concat([iv, encrypted, authTag]);
		const randomSuffix = Math.random().toString(36).substring(2, 8);
		const outputPath = join(tmpdir(), `${basename(pathname)}.${randomSuffix}.enc`);
		await writeFile(outputPath, combined);
		return outputPath;
	}

	async decrypt(pathname: string): Promise<string> {
		const fileBufer = await readFile(pathname);

		const iv = fileBufer.subarray(0, 12);
		const authTag = fileBufer.subarray(fileBufer.length - 16);
		const encrypted = fileBufer.subarray(12, fileBufer.length - 16);

		const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
		decipher.setAuthTag(authTag);

		const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
		const randomSuffix = Math.random().toString(36).substring(2, 8);
		const base = basename(pathname).replace(/\.enc$/, '');
		const outputPath = join(tmpdir(), `${base}.${randomSuffix}.dec`);
		await writeFile(outputPath, decrypted);
		return outputPath;
	}
}
