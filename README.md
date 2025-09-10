# Fine-tuning models with SDA documentation

This project uses **Deno** (a TypeScript runtime) and **mlx-lm** (a Python
package optimized for Apple Silicon chips) to train AI models using the
[Simple Data Analysis](https://github.com/nshiab/simple-data-analysis)
documentation.

## What you need first

Install these tools before you start:

1. **Deno** - [Get it here](https://deno.com/)
2. **Python package mlx-lm**:
   ```bash
   pip3 install mlx-lm
   pip3 install "mlx-lm[train]"
   ```
3. **Ollama** - [Get it here](https://ollama.com/)

## Step 1: Create Training Data

First, we need to create training data from the SDA documentation. This step
takes the documentation and creates question-answer pairs using AI.

**Run this command:**

```bash
deno task generate
```

**What happens:**

1. Downloads the latest Simple Data Analysis documentation
2. Splits the documentation into smaller pieces
3. Uses AI models to create questions and answers
4. Saves everything in a format ready for training

**Files are saved here:**

- Documentation: `sda/data/sdaDocs.md`
- Training data: `sda/output/trainingData.json`
- If these files already exist, this step is skipped

**Files created:**

- `sda/output/trainingData.json` - All the question-answer pairs
- `sda/output/train.jsonl` - Training data for the AI
- `sda/output/valid.jsonl` - Validation data for the AI
- `sda/output/test.jsonl` - Test data for the AI

## Step 2: Train the AI Models

Now we train several AI models using our training data.

**Run this command:**

```bash
deno task train
```

**What happens:**

1. Checks what models are already trained (skips those)
2. Downloads any new models that need training
3. Trains each model and tracks how well it's learning
4. Saves the results

**Files are saved here:**

- Training durations: `results-data/durations.json`
- Learning progress: `results-data/trainLoss.json`
- Already-trained models are skipped automatically

**Files created:**

- `adapters/{model-name}/adapters.safetensors` - The trained model
- `adapters/{model-name}/adapter_config.json` - Model settings
- `results-data/durations.json` - How long each model took to train
- `results-data/trainLoss.json` - How well each model learned

## Step 3: Create Charts

After training, create visual charts showing training progress and durations.

**Run this command:**

```bash
deno task charts
```

**What happens:**

1. Reads the training loss and duration data
2. Creates charts showing how well models learned over time
3. Creates charts showing how long each model took to train
4. Saves the charts as image files

**Files created:**

- `results-data/trainLoss.png` - Chart showing learning progress
- `results-data/durations.png` - Chart showing training times

## Step 4: Test How Good the Models Are

After creating charts, we test all the models to see which ones give the best
answers.

**Run this command:**

```bash
deno task test
```

**What happens:**

1. Finds all the trained models
2. Asks each model the same test questions
3. Uses other AI models to score the answers
4. Creates a report showing which models are best

**Files are saved here:**

- Model answers: `results-data/fine-tuned-model-responses.json`
- If the answers already exist, testing is skipped

**Files created:**

- `results-data/tests.json` - Detailed results with scores and explanations
- `results-data/tests.md` - Easy-to-read table with rankings

**How answers are scored:**

- **1.0**: Perfect answer
- **0.8**: Good answer with small problems
- **0.6**: Okay answer but missing some things
- **0.4**: Poor answer with big problems
- **0.2**: Very bad answer, mostly wrong
- **0.0**: Completely wrong answer

## Other Useful Commands

**Do everything at once:**

```bash
deno task all
```

Runs all steps: create data → train models → make charts → test models

**Clean up cache files:**

```bash
deno task clean
```

Deletes temporary files to start fresh.

Have fun!
