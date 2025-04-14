declare module '@xenova/transformers' {
  function pipeline(
    task: string,
    model: string
  ): Promise<(text: string, options: { pooling: string; normalize: boolean }) => Promise<{ data: Float32Array }>>;

  const env: {
    allowRemoteModels: boolean;
    localModelPath: string;
  };

  export { pipeline, env };
} 