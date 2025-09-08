export default async function downloadModel(model: string) {
  console.log(`📥 Pre-downloading model: ${model}`);

  const command = new Deno.Command("python3", {
    args: [
      "-m",
      "mlx_lm.generate",
      "--model",
      model,
      "--prompt",
      "Hello", // Simple prompt just to trigger model download
      "--max-tokens",
      "1", // Minimal generation to save time
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const process = command.spawn();

  // Read and display output
  const decoder = new TextDecoder();
  const reader = process.stdout.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      if (chunk.trim()) {
        // Only show download progress, not the generated text
        if (
          chunk.includes("Fetching") || chunk.includes("Loading") ||
          chunk.includes("%")
        ) {
          console.log(chunk.trim());
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Read stderr
  const stderrReader = process.stderr.getReader();
  try {
    while (true) {
      const { done, value } = await stderrReader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      if (chunk.trim()) {
        console.error(chunk);
      }
    }
  } finally {
    stderrReader.releaseLock();
  }

  const { success } = await process.status;

  if (!success) {
    throw new Error(`Model download failed for ${model}`);
  }

  console.log(`✅ Model downloaded: ${model}\n`);
}
