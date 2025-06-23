import { ImageScaler } from './image-scaler';

export interface PreviewGenerator {
	/**
	 * makes a preview image from the file
	 * @param filename the file to create a thumbail for
	 */
	generate(filename: string): Promise<string>;
}

export class ImagePreviewGenerator implements PreviewGenerator {
	private readonly MAX_WIDTH_PX = 250;
	private readonly scaler: ImageScaler;

	constructor(scaler: ImageScaler) {
		this.scaler = scaler;
	}

	generate(filename: string): Promise<string> {
		return this.scaler.scale(filename, this.MAX_WIDTH_PX);
	}
}

export class PreviewGeneratorFactory {
	private generators: Map<string, PreviewGenerator> = new Map();

	register(mime_type: string, generator: PreviewGenerator): void {
		this.generators.set(mime_type, generator);
	}

	generate(mime_type: string): PreviewGenerator | null {
		return this.generators.get(mime_type) || null;
	}
}
