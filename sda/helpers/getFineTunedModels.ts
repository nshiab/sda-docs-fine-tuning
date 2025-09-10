import { existsSync } from "node:fs";

export default function getFineTunedModels(): string[] {
  const adaptersDir = "adapters";
  const models: string[] = [];

  for (const entry of Deno.readDirSync(adaptersDir)) {
    if (entry.isDirectory) {
      const adapterPath = `${adaptersDir}/${entry.name}`;
      const adaptersFile = `${adapterPath}/adapters.safetensors`;
      const configFile = `${adapterPath}/adapter_config.json`;

      // Only include models that have both required adapter files
      if (existsSync(adaptersFile) && existsSync(configFile)) {
        // Convert adapter directory name back to model name format
        models.push(`mlx-community/${entry.name}`);
      }
    }
  }

  return models.sort(); // Sort for consistent ordering
}
