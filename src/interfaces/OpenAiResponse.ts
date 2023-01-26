export interface OpenAiImage {
  b64_json?: string;
}

export interface OpenAiResponse {

  data: OpenAiImage[];
}


export type ImageResult = ImageResultReady | ImageResultError

export interface ImageResultError {
  error: string;
  status:  'error';
}

export interface ImageResultReady {
  created: string;
  dataUrl: string;
  status: 'ready';
}