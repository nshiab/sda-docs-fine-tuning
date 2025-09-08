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
- `deno task clean` - Clean cache directories

## Generating training data

> [!TIP]
> If you are only interested in training models, skip this section. All the
> training data is already in the repository.

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

## Training models

The training process has been automated and enhanced with several features:

### Automated Training with Loss Tracking

To train models with automatic loss tracking and accurate timing:

```bash
deno task train
```

This command will:

1. **Pre-download models** to ensure accurate timing measurements
2. **Train each model** specified in `sda/train.ts`
3. **Capture iteration losses** automatically during training
4. **Save results** to multiple output files

### What gets generated automatically:

- `results-data/durations.json` - Training duration for each model
- `results-data/trainLoss.json` - Complete iteration loss data for all models

### Configuring models to train

Edit the `models` array in `sda/train.ts` to specify which models to train:

```typescript
const models = [
  "mlx-community/gemma-3-270m-it-4bit",
  "mlx-community/gemma-3-1b-it-4bit",
  // Add more models here...
];
```

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
  "model": "mlx-community/gemma-3-270m-it-4bit"
}
```

This data is automatically captured during training and can be used for analysis
and visualization.

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
    --model mlx-community/gemma-3-270m-it-4bit \
    --adapter-path adapters/gemma-3-270m-it-4bit \
    --prompt "How can I open a CSV file?"
```

You can manually add the results of these prompts to `results-data/tests.md`.

## Complete Workflow

To run the entire pipeline from data generation to chart creation:

```bash
deno task all
```

This will:

1. Generate training data from SDA documentation
2. Train all specified models with loss tracking
3. Generate visualization charts

Have fun!
