export default async function promptFineTunedModel(
  model: string,
  adapterPath: string,
  prompt: string,
): Promise<string> {
  console.log(
    `Prompting ${model} with: "${prompt}"`,
  );

  const command = new Deno.Command("python3", {
    args: [
      "-m",
      "mlx_lm.generate",
      "--model",
      model,
      "--adapter-path",
      adapterPath,
      "--prompt",
      prompt,
      "--max-tokens",
      "10000",
    ],
    stdout: "piped",
    stderr: "piped",
  });

  try {
    const { code, stdout, stderr } = await command.output();

    if (code !== 0) {
      const errorText = new TextDecoder().decode(stderr);
      throw new Error(`Python command failed: ${errorText}`);
    }

    const output = new TextDecoder().decode(stdout);

    // Extract just the generated text (remove the prompt echo and MLX warnings)
    const lines = output.split("\n");

    const generatedLines = lines.filter((line) => {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) return false;

      // Skip MLX deprecation warning
      if (
        trimmedLine.includes(
          "Calling `python -m mlx_lm.generate...` directly is deprecated",
        )
      ) return false;
      if (
        trimmedLine.includes(
          "Use `mlx_lm.generate...` or `python -m mlx_lm generate ...` instead",
        )
      ) return false;

      // Skip separator lines
      if (trimmedLine === "==========") return false;
      if (trimmedLine.match(/^=+$/)) return false;

      // Skip common MLX warning/info messages
      if (trimmedLine.includes("Loading model")) return false;
      if (trimmedLine.includes("Generating")) return false;
      if (trimmedLine.includes("Special tokens")) return false;
      if (trimmedLine.includes("tokenizer")) return false;
      if (trimmedLine.includes("Using default")) return false;
      if (trimmedLine.includes("Warning")) return false;
      if (trimmedLine.includes("INFO")) return false;
      if (trimmedLine.includes("DEBUG")) return false;
      if (trimmedLine.includes("tokens/sec")) return false;
      if (trimmedLine.includes("Peak memory")) return false;

      // Skip lines that start with the exact prompt
      if (trimmedLine.startsWith(prompt.trim())) return false;

      // Skip lines that are just the prompt repeated
      if (trimmedLine === prompt.trim()) return false;

      return true;
    });

    // Join the remaining lines and clean up
    let response = generatedLines.join("\n").trim();

    // If the response starts with the prompt, remove it
    if (response.startsWith(prompt.trim())) {
      response = response.substring(prompt.trim().length).trim();
    }

    // Remove any leading/trailing whitespace and newlines
    response = response.replace(/^\s+|\s+$/g, "");

    return response;
  } catch (error) {
    console.error(`Error running python command for ${model}:`, error);
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}
