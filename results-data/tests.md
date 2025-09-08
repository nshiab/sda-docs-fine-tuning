# Results

All models are 4 bits and were downloaded from the Hugging Face MLX community.

Winners:

- 🥇 gemma-27b
- 🥇 llama-8b
- 🥈 gemma-4b
- 🥈 gemma-12b
- 🥉 llama-3b

✅ It works! (1 point) | 😑 So close... (0.5 point) | ❌ Hallucinations (0
point)

| Prompt                                                                                                  | gemma-3-270m | gemma-1b | llama-1b | llama-3b | gemma-4b | llama-8b | gemma-12b | gemma-27b |
| ------------------------------------------------------------------------------------------------------- | ------------ | -------- | -------- | -------- | -------- | -------- | --------- | --------- |
| How can I open a CSV file?                                                                              | ❌           | ❌       | ❌       | ✅       | ✅       | ✅       | ✅        | 😑        |
| I have a table with two columns: province and fireId. How can I count the number of fires per province? | ❌           | ❌       | ❌       | ❌       | ❌       | ❌       | ❌        | 😑        |
| How can I open a geojson file and fix the errors in its geometries?                                     | ❌           | ❌       | ❌       | 😑       | 😑       | 😑       | 😑        | 😑        |
| Can I use an AI model to categorize the data in the column 'customer_complaints'?                       | ❌           | ❌       | ❌       | ❌       | ❌       | ❌       | ❌        | ❌        |
| I want to create a simple chart in the terminal to visualize my data.                                   | ❌           | ❌       | ✅       | ❌       | ❌       | 😑       | ❌        | 😑        |
| I want to write my data to a parquet file. How?                                                         | ❌           | ❌       | ✅       | ❌       | ✅       | ✅       | ✅        | ✅        |
| Total points                                                                                            | 0            | 0        | 2        | 1.5      | 2.5      | 3        | 2.5       | 3         |

Comparison with Gemini 2.5 Flash without documentation and with documentation
(≈45,000 tokens) copied and pasted after the prompt.

Note that "with the Simple Data Analysis library (TypeScript)" was added to the
prompts.

| Prompt                                                                                                                                                      | Gemini 2.5 Flash (no docs) | Gemini 2.5 Flash (with docs) |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------- |
| How can I open a CSV file with the Simple Data Analysis library (TypeScript) ?                                                                              | ❌                         | ✅                           |
| I have a table with two columns: province and fireId. How can I count the number of fires per province with the Simple Data Analysis library (TypeScript) ? | ❌                         | ✅                           |
| How can I open a geojson file and fix the errors in its geometries with the Simple Data Analysis library (TypeScript) ?                                     | ❌                         | ✅                           |
| Can I use an AI model to categorize the data in the column 'customer_complaints' with the Simple Data Analysis library (TypeScript) ?                       | ❌                         | ✅                           |
| I want to create a simple chart in the terminal to visualize my data with the Simple Data Analysis library (TypeScript).                                    | ❌                         | ✅                           |
| I want to write my data to a parquet file with the Simple Data Analysis library (TypeScript). How ?                                                         | ❌                         | ✅                           |
| Total points                                                                                                                                                | 0                          | 6                            |
