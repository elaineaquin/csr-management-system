import { join } from 'path';
import sharp from 'sharp';

export interface ImageScaler {
	/**
	 * Scales an image to a max width
	 *
	 * @param filename the name of the input image
	 * @param maxWidth the max width in pixels
	 * @returns the output filename, scaled
	 */
	scale(filename: string, maxWidth: number): Promise<string>;

	/**
	 * Returns whether the image scaler supports scaling given mimetype
	 * @param mimeType the mime_type
	 */
	supported(mimeType: string): boolean;
}

export class SharpImageScaler implements ImageScaler {
	async scale(filename: string, maxWidth: number): Promise<string> {
		const absoluteFilePath = join('/tmp', filename);
		const outfile = absoluteFilePath + '.resized.jpg';
		const relativeOutfile = filename + '.resized.jpg';
		await sharp(absoluteFilePath).resize(maxWidth).toFile(outfile);
		return relativeOutfile;
	}

	supported(mimeType: string): boolean {
		return mimeType === 'image/jpeg' || mimeType === 'image/png' || mimeType === 'image/gif';
	}
}
