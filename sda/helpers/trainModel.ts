export default async function trainModel(
  model: string,
  iterations: number,
) {
  const adapterPath = `adapters/${model.split("/").pop()}`;

  console.log(`\nStarting training for ${model}...`);

  const losses: {
    iteration: number;
    trainLoss?: number;
    valLoss?: number;
    learningRate?: number;
    tokensPerSec?: number;
    trainedTokens?: number;
  }[] = [];

  const command = new Deno.Command("python3", {
    args: [
      "-m",
      "mlx_lm.lora",
      "--model",
      model,
      "--train",
      "--data",
      "sda/output",
      "--adapter-path",
      adapterPath,
      "--iters",
      iterations.toString(),
    ],
    stdout: "piped",
    stderr: "piped",
  });

  console.log(`\nTraining model: ${model}`);
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
          });
        }

        // Parse validation loss lines
        const valMatch = line.match(/Iter (\d+): Val loss ([\d.]+)/);
        if (valMatch) {
          const iter = parseInt(valMatch[1]);
          const existingEntry = losses.find((l) => l.iteration === iter);
          if (existingEntry) {
            existingEntry.valLoss = parseFloat(valMatch[2]);
          } else {
            losses.push({
              iteration: iter,
              valLoss: parseFloat(valMatch[2]),
            });
          }
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
    throw new Error(`Training failed for ${model}`);
  }

  return losses;
}
