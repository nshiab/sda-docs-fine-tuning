# Fine-tuning models with SDA documentation

This repository is used to fine-tune models on the
[Simple Data Analysis](https://github.com/nshiab/simple-data-analysis)
documentation using [mlx-lm](https://github.com/ml-explore/mlx-lm), a Python
package optimized for Apple silicon computers.

## Generating training data

> [!TIP]
> If you are only interested in training models, skip this section. All the
> training data is already in the repository.

To generate the training data, the `sda/main.ts` script fetches the latest
documentation and then generates questions and answers with several open-weight
models using [Ollama](https://ollama.com/).

To run the script, you need to install Ollama and download the models first. If
the models specified at the top of the script are too large, feel free to change
them to smaller ones.

To run it with Deno:

```
deno task sda
```

You can see the training data in `sda/output`.

## Training models

To fine-tune the models, you need to install the Python package
[mlx-lm](https://github.com/ml-explore/mlx-lm):

```
pip3 install mlx-lm
```

And the training dependencies:

```
pip3 install "mlx-lm[train]"
```

Now, models from the
[MLX Community on Hugging Face](https://huggingface.co/mlx-community/models) can
be downloaded and fine-tuned using this command:

```
time python3 -m mlx_lm.lora \
--model mlx-community/gemma-3-270m-it-4bit \
--train \
--data sda/output
```

This command uses the default parameters. For more information on the available
options, see: https://github.com/ml-explore/mlx-lm/blob/main/mlx_lm/LORA.md

The `time` command will tell you how long the training took.

Once training is done, you can update `sda/charts.ts` with your model and the
training duration to generate the `results-data/durations.png` chart.

To retrieve the iteration statistics, you can copy and paste the terminal output
into your favorite LLM and ask it to restructure it as a JSON array of objects
with at least the keys `iteration`, `model`, and `trainLoss`. Put the JSON file
into the `results-data/` folder. The JSON files in this folder are used by
`sda/charts.ts` to create `results-data/trainLoss.png`.

To create the charts, run this command with Deno:

```
deno task charts
```

Once all the terminal output is retrieved, you can manually test prompts with
this command:

```
python3 -m mlx_lm.generate \
    --model mlx-community/gemma-3-270m-it-4bit \
    --adapter-path adapters \
    --prompt "How can I open a CSV file?"
```

You can then manually add the results of these prompts to
`results-data/tests.md`.

Have fun!
