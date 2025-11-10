export default async function trainModel(
  model: {
    name: string;
    mlx: string;
    type: string;
  },
  iterations: number,
) {
  const start = Date.now();

  const adapterPath = `models/${model.name}/adapters`;

  const losses: {
    iteration: number;
    trainLoss?: number;
    valLoss?: number;
    learningRate?: number;
    tokensPerSec?: number;
    trainedTokens?: number;
    model: string;
  }[] = [];

  const args = [
    "-m",
    "mlx_lm.lora",
    "--model",
    model.mlx,
    "--train",
    "--data",
    "sda/output",
    "--adapter-path",
    adapterPath,
    "--iters",
    iterations.toString(),
    "--fine-tune-type",
    model.type,
  ];

  console.log("Arguments:", args.join(" "));

  const command = new Deno.Command("python3", {
    args,
    stdout: "piped",
    stderr: "piped",
  });

  const process = command.spawn();

  // Read stdout line by line
  const decoder = new TextDecoder();
  const reader = process.stdout.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.trim()) {
        console.log(line); // Still print to console

        // Parse training loss lines
        const trainMatch = line.match(
          /Iter (\d+): Train loss ([\d.]+), Learning Rate ([\d.e-]+), .*, Tokens\/sec ([\d.]+), Trained Tokens (\d+)/,
        );
        if (trainMatch) {
          losses.push({
            iteration: parseInt(trainMatch[1]),
            trainLoss: parseFloat(trainMatch[2]),
            learningRate: parseFloat(trainMatch[3]),
            tokensPerSec: parseFloat(trainMatch[4]),
            trainedTokens: parseInt(trainMatch[5]),
            model: model.name,
          });
        }
      }
    }
  }
  reader.releaseLock();

  // Read stderr and print it
  const stderrReader = process.stderr.getReader();
  while (true) {
    const { done, value } = await stderrReader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    if (chunk.trim()) {
      console.error(chunk);
    }
  }
  stderrReader.releaseLock();

  const { success } = await process.status;

  if (!success) {
    throw new Error(`Training failed for ${model.name}`);
  }

  const duration = Date.now() - start;
  console.log(
    `Completed training: ${model.name} (${
      (duration / 1000 / 60).toFixed(1)
    } minutes)\n`,
  );
  await Deno.writeTextFile(
    `models/${model.name}/trainLoss.json`,
    JSON.stringify(losses, null, 2),
  );
  console.log(`Saved training losses for ${model.name}\n`);
  await Deno.writeTextFile(
    `models/${model.name}/duration.json`,
    JSON.stringify({
      model: model.name,
      duration: duration,
    }),
  );
  console.log(`Saved training duration for ${model.name}\n`);
}
