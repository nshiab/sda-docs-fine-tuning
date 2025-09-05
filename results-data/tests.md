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

## gemma-3-270m

With https://huggingface.co/mlx-community/gemma-3-270m-it-4bit

"How can I open a CSV file?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
// Open a CSV file in a new tab
await table.open("output.csv", { type: "csv" });
await sdb.done();
```

"I have a table with two columns: province and fireId. How can I count the
number of fires per province?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
// Count the number of fires per province
await table.countFire("province", "fireId");
await sdb.done();
```

"How can I open a geojson file and fix the errors in its geometries?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
// Open a geojson file in GeoJSON format
await table.openGeoJson("output.geojson", { geometry: true });
await sdb.done();
```

"Can I use an AI model to categorize the data in the column
'customer_complaints'?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
// Use an AI model to categorize the data
const classification = await table.categorize("customer_complaints", {
  categories: "category1",
  categories: "category2",
});
```

"I want to create a simple chart in the terminal to visualize my data."

```ts
import { SimpleDB } from '@nshiab/simple-data-analysis';
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData('path/to/your/data.csv');
// Create a simple chart with a single column
await table.createChart('myChart', {
  chartType: 'simple',
  chartName: 'myChart',
  chartColumn: '
```

"I want to write my data to a parquet file. How?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.writeData(
  "data",
  "parquet",
  "parquet",
  "parquet",
  "parquet",
  "parquet",
  "parquet",
```

## gemma-3-1b

With https://huggingface.co/mlx-community/gemma-3-1b-it-qat-4bit

"How can I open a CSV file?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.open("data.csv");
await table.open("data.csv", { open: true });
await table.open("data.csv", { open: true, mode: "csv
```

"I have a table with two columns: province and fireId. How can I count the
number of fires per province?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.count({ province: "yourProvince", fireId: "yourFireId" });
await sdb.done();
```

"How can I open a geojson file and fix the errors in its geometries?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.geo("geometry", "geometry");
await table.openGeo("geometry");
await table.done();
```

"Can I use an AI model to categorize the data in the column
'customer_complaints'?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.categorize("customer_complaints", {
  category: "Complaint Type",
  description: "Detailed description of the complaint",
  output: "complaint_category",
});
```

"I want to create a simple chart in the terminal to visualize my data."

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
// Create a simple chart using the 'bar' function
await table.bar("category");
await sdb.done();
```

"I want to write my data to a parquet file. How?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.parquet("output.parquet");
```

## llama-3.2-1b

With https://huggingface.co/mlx-community/Llama-3.2-1B-Instruct-4bit

"How can I open a CSV file?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.open("path/to/your/output.csv");
await sdb.done();
```

"I have a table with two columns: province and fireId. How can I count the
number of fires per province?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
// Count the number of fires per province
const provinces = await table.getColumns("province");
const provincesFires = await table.getColumns("fireId");
const provinceFiresCount = provinces.map((province) => provincesFires.filter(fire => f.id === province).
```

"How can I open a geojson file and fix the errors in its geometries?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.geojson");
// Fix geometries in the file
await table.fixGeometries();
await sdb.done();
```

"Can I use an AI model to categorize the data in the column
'customer_complaints'?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
// Use an AI model to categorize the data in the 'customer_complaints' column
await table.aiCategorize("customer_complaints", "category");
await sdb.done();
```

"I want to create a simple chart in the terminal to visualize my data."

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
// Create a simple bar chart
await table.logBarChart("category", "value");
await sdb.done();
```

"I want to write my data to a parquet file. How?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.writeData("./output.parquet");
await sdb.done();
```

## llama-3.2-3b

https://huggingface.co/mlx-community/Llama-3.2-3B-Instruct-4bit

"How can I open a CSV file?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.logTable();
await sdb.done();
```

"I have a table with two columns: province and fireId. How can I count the
number of fires per province?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
const provinceFireCounts = await table.getProvinces();
console.log(provinceFireCounts);
await sdb.done();
```

"How can I open a geojson file and fix the errors in its geometries?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.geojson");
// Fix errors in geometries
await table.fixGeo();
await sdb.done();
```

"Can I use an AI model to categorize the data in the column
'customer_complaints'?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
// Use the AI model to categorize the data in 'customer_complaints'
await table.aiCategorize("customer_complaints", "category");
await sdb.done();
```

"I want to create a simple chart in the terminal to visualize my data."

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
// Create a bar chart of 'value' column
await table.barChart("value", { title: "Value Chart" });
await sdb.done();
```

"I want to write my data to a parquet file. How?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.writeParquet("output.parquet");
await sdb.done();
```

## gemma-3-4b

With https://huggingface.co/mlx-community/gemma-3-4b-it-qat-4bit

"How can I open a CSV file?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await sdb.done();
```

"I have a table with two columns: province and fireId. How can I count the
number of fires per province?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.fireFiresPerProvince();
await sdb.done();
```

"How can I open a geojson file and fix the errors in its geometries?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadGeoData("./data.geojson");
// Fix errors in geometries
await table.fixGeojson("./data.geojson");
await sdb.done();
```

"Can I use an AI model to categorize the data in the column
'customer_complaints'?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.categorizeColumn("customer_complaints", {
  "shipping": (value) => value.toLowerCase().includes("shipping"),
  "returns": (value) => value.toLowerCase().
```

"I want to create a simple chart in the terminal to visualize my data."

```ts
import { SimpleDB } from '@nshiab/simple-data-analysis';
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData('path/to/your/data.csv');
// Create a bar chart
await table.plotBarChart('sales', 'sales', {
  title: 'Sales by Category',
  xLabels: true,
  yLabels: true,
```

"I want to write my data to a parquet file. How?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.writeData("./output.parquet");
await sdb.done();
```

## llama-3.1-8b

With https://huggingface.co/mlx-community/Llama-3.1-8B-Instruct-4bit

"How can I open a CSV file?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await sdb.done();
```

"I have a table with two columns: province and fireId. How can I count the
number of fires per province?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.count("fireId", "province", "fireCount");
await sdb.done();
```

"How can I open a geojson file and fix the errors in its geometries?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
// Fix geometries
await table.fixGeo();
await sdb.done();
```

"Can I use an AI model to categorize the data in the column
'customer_complaints'?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.aiCategorizeColumn("customer_complaints", "category");
await sdb.done();
```

"I want to create a simple chart in the terminal to visualize my data."

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
// Create a bar chart
await table.logBarChart("Sales by Region");
await sdb.done();
```

"I want to write my data to a parquet file. How?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.writeData("./output.parquet");
await sdb.done();
```

## gemma-3-12b

With https://huggingface.co/mlx-community/gemma-3-12b-it-qat-4bit

"How can I open a CSV file?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("./data.csv");
await sdb.done();
```

"I have a table with two columns: province and fireId. How can I count the
number of fires per province?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.countFiresPerProvince();
await sdb.done();
```

"How can I open a geojson file and fix the errors in its geometries?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadGeoData("./data.geojson");
// Fix errors in geometries
await table.fixGeomErrors();
await sdb.done();
```

"Can I use an AI model to categorize the data in the column
'customer_complaints'?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.logTable();
await table.categorizeData("customer_complaints", {
  categories: ["billing", "shipping", "product_quality", "customer_service", "other"],
```

"I want to create a simple chart in the terminal to visualize my data."

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.logTable();
await sdb.done();
```

"I want to write my data to a parquet file. How?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.writeData("output.parquet");
await sdb.done();
```

## gemma-3-27b

With https://huggingface.co/mlx-community/gemma-3-27b-it-qat-4bit

"How can I open a CSV file?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadDataFromCSV("data.csv");
await sdb.done();
```

"I have a table with two columns: province and fireId. How can I count the
number of fires per province?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.summarize({
  values: "province",
  summaries: "count",
  outputTable: "fires_per_province",
});
await sdb.done();
```

"How can I open a geojson file and fix the errors in its geometries?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadGeoData("./data.geojson");
// Fix invalid geometries
await table.fixGeometries();
await sdb.done();
```

"Can I use an AI model to categorize the data in the column
'customer_complaints'?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.ai("customer_complaints", "categorize");
await sdb.done();
```

"I want to create a simple chart in the terminal to visualize my data."

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("data/sample.csv");
await table.logBarChart("category", "value", 10);
await sdb.done();
```

"I want to write my data to a parquet file. How?"

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
const sdb = new SimpleDB();
const table = sdb.newTable();
await table.loadData("path/to/your/data.csv");
await table.writeData("./output.parquet");
await sdb.done();
```
