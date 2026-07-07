import { Resvg, initWasm } from '@resvg/resvg-wasm';
import wasm from '@resvg/resvg-wasm/index_bg.wasm';
import type { TransformOptions } from '../types';
import { HttpError } from '../utils/errors';

const wasmReady = initWasm(wasm);

export async function convertSvgToPng(svg: string, options: TransformOptions): Promise<Uint8Array> {
  await wasmReady;

  try {
    const resvg = new Resvg(svg, {
      fitTo:
        options.width || options.height
          ? {
              mode: options.width && options.height ? 'width' : 'zoom',
              value: options.width ?? options.height ?? 1,
            }
          : undefined,
      background: options.background,
    });

    return resvg.render().asPng();
  } catch {
    throw new HttpError(422, 'Failed to convert SVG to PNG.');
  }
}
