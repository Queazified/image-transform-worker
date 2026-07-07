export interface TransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  background?: string;
}

export interface RouteMatch {
  kind: 'svg-to-png' | 'transform';
  format?: string;
  encodedSourceUrl: string;
}
