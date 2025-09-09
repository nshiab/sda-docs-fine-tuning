# Fine-tuning models with SDA documentation

This repository is used to fine-tune models on the
[Simple Data Analysis](https://github.com/nshiab/simple-data-analysis)
documentation using [mlx-lm](https://github.com/ml-explore/mlx-lm), a Python
package optimized for Apple silicon computers.

## Prerequisites

Before running the training scripts, you need to install the Python package
[mlx-lm](https://github.com/ml-explore/mlx-lm):

```bash
pip3 install mlx-lm
```

And the training dependencies:

```bash
pip3 install "mlx-lm[train]"
```

## Available Commands

This project provides several Deno tasks for different stages of the workflow:

- `deno task generate` - Generate training data from SDA documentation
- `deno task train` - Train models with automatic loss tracking
- `deno task charts` - Generate visualization charts
- `deno task all` - Run the complete pipeline (generate → train → charts)

## Generating training data

To generate the training data, the `sda/generate.ts` script fetches the latest
documentation and then generates questions and answers with several open-weight
models using [Ollama](https://ollama.com/).

To run the script, you need to install Ollama and download the models first. If
the models specified at the top of the script are too large, feel free to change
them to smaller ones.

To generate training data:

```bash
deno task generate
```

You can see the training data in `sda/output`.

> [!NOTE]
> The generate script automatically checks if training data already exists at
> `sda/output/trainingData.json`. If the file exists, it will skip the
> generation process. The training data is committed.

## Training models

The training process has been automated and enhanced with several intelligent
features:

### Smart Training with Resumption Support

To train models with automatic loss tracking, resumption support, and accurate
timing:

```bash
deno task train
```

This command provides intelligent training management:

1. **Loads existing results** from previous training runs
2. **Checks for already-trained models** by examining adapter files
3. **Skips completed models** automatically to avoid duplicate work
4. **Pre-downloads only needed models** to ensure accurate timing measurements
5. **Trains each remaining model** specified in `sda/train.ts`
6. **Captures iteration losses** automatically during training
7. **Updates results** without creating duplicates

### Resumption and Duplicate Prevention

The training system now intelligently handles interruptions and reruns:

- **Automatic model detection**: Checks if `adapters.safetensors` and
  `adapter_config.json` exist
- **Safe resumption**: Skips already-trained models and continues with remaining
  ones
- **No duplicate data**: Prevents accumulation of duplicate entries in result
  files
- **Preserves existing results**: Loads and maintains previous training data

### What gets generated automatically:

- `results-data/durations.json` - Training duration for each model (no
  duplicates)
- `results-data/trainLoss.json` - Complete iteration loss data for all models
  (deduplicated)

### Configuring models to train

Edit the `models` array in `sda/train.ts` to specify which models to train:

```typescript
const models = [
  "mlx-community/gemma-3-270m-it-8bit",
  "mlx-community/gemma-3-1b-it-8bit",
  "mlx-community/gemma-3-4b-it-8bit",
  "mlx-community/gemma-3-12b-it-8bit",
];
```

The system will automatically detect which models have already been trained and
skip them on subsequent runs.

## Loss Data Structure

The `results-data/trainLoss.json` file contains an array of objects with the
following structure:

```json
{
  "iteration": 10,
  "trainLoss": 3.825,
  "valLoss": 4.951,
  "learningRate": 0.00001,
  "tokensPerSec": 5682.672,
  "trainedTokens": 4779,
  "model": "mlx-community/gemma-3-270m-it-8bit"
}
```

This data is automatically captured during training and can be used for analysis
and visualization. The system prevents duplicate entries when rerunning
training.

## Generating Charts

Once training is complete, generate visualization charts:

```bash
deno task charts
```

This creates:

- `results-data/durations.png` - Training duration comparison chart
- `results-data/trainLoss.png` - Training loss progression chart

## Testing Models

After training, you can test your fine-tuned models:

```bash
python3 -m mlx_lm.generate \
    --model mlx-community/gemma-3-270m-it-8bit \
    --adapter-path adapters/gemma-3-270m-it-8bit \
    --prompt "How can I open a CSV file?"
```

You can manually add the results of these prompts to `results-data/tests.md`.

## Complete Workflow

To run the entire pipeline from data generation to chart creation:

```bash
deno task all
```

This will:

1. Generate training data from SDA documentation (skipped if already exists)
2. Train all specified models with smart resumption and loss tracking
3. Generate visualization charts

The entire pipeline is designed to be resumable and will skip completed steps
automatically.

Have fun!
