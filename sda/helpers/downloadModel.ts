export default async function downloadModel(model: string) {
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
  });

  const { success } = await command.output();

  if (!success) {
    throw new Error(`Model download failed for ${model}`);
  }

  console.log(`Model downloaded: ${model}`);
}
