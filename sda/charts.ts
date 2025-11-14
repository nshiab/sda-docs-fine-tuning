import { SimpleDB } from "@nshiab/simple-data-analysis";
import {
  barX,
  dot,
  line,
  plot,
  selectLast,
  text,
  textX,
} from "@observablehq/plot";
import models from "./models.json" with { type: "json" };
import testQuestions from "./testQuestions.json" with { type: "json" };

const sdb = new SimpleDB();

const durations = sdb.newTable("durations");
await durations.loadData("models/**/duration.json");
await durations.updateColumn("duration", `ROUND(duration / 1000)`); // Convert ms to sec
await durations.logTable();
await durations.writeChart((data) =>
  plot({
    title: "Training durations",
    x: {
      grid: true,
      tickFormat: (d) => {
        const hours = Math.floor(d / 3600);
        return `${hours}h`;
      },
      ticks: [3600, 7200, 10800, 14400],
      label: null,
    },
    y: {
      label: null,
    },
    marginLeft: 120,
    marginRight: 60,
    marks: [
      barX(data, {
        y: "model",
        x: "duration",
        fill: "orange",
        sort: {
          y: "x",
        },
      }),
      textX(data, {
        x: "duration",
        y: "model",
        text: (d) => {
          const hours = Math.floor(d.duration / 3600);
          const minutes = Math.floor((d.duration % 3600) / 60);
          const seconds = d.duration % 60;
          return hours > 0
            ? `${hours}h ${minutes}m ${seconds}s`
            : `${minutes}m ${seconds}s`;
        },
        fill: "black",
        textAnchor: "start",
        dx: 5,
      }),
    ],
  }), "sda/output/durations.png");
console.log("Duration chart saved to sda/output/durations.png");

// Training loss over time
const trainingLossOverTime = await sdb.newTable("trainingLossOverTime")
  .loadData(
    "models/**/trainLoss.json",
  );
await trainingLossOverTime.sort({ "iteration": "asc" });
await trainingLossOverTime.bins("iteration", 100, "iterationBin", {
  startValue: 0,
});
await trainingLossOverTime.splitExtract(
  "iterationBin",
  "-",
  1,
  "iterationExtracted",
);
await trainingLossOverTime.replace("iterationExtracted", { "]": "" });
await trainingLossOverTime.convert({ iterationExtracted: "number" });
await trainingLossOverTime.summarize({
  values: "trainLoss",
  categories: ["model", "iterationExtracted"],
  summaries: { trainLoss: "mean" },
  noColumnValue: true,
});
await trainingLossOverTime.renameColumns({ iterationExtracted: "iteration" });
await trainingLossOverTime.filter(`iteration >= 1000`);
await trainingLossOverTime.logTable();
await trainingLossOverTime.writeChart((data) =>
  plot({
    title: "Average training loss over time, starting from iteration 1000",
    grid: true,
    inset: 10,
    marginRight: 100,
    marks: [
      line(data, {
        x: "iteration",
        y: "trainLoss",
        stroke: "model",
        curve: "catmull-rom",
        strokeWidth: 1,
      }),
      dot(
        data,
        selectLast({
          x: "iteration",
          y: "trainLoss",
          fill: "model",
        }),
      ),
      text(
        data,
        selectLast({
          x: "iteration",
          y: "trainLoss",
          z: "model",
          text: "model",
          stroke: "white",
          fill: "model",
          textAnchor: "start",
          dx: 10,
        }),
      ),
    ],
  }), "sda/output/trainLossOverTime.png");
console.log("Training loss chart saved to sda/output/trainLossOverTime.png");

// Final training loss
const finalTrainingLoss = await sdb.newTable("finalTrainingLoss")
  .loadData(
    "models/**/trainLoss.json",
  );
await finalTrainingLoss.keep({ iteration: 5000 });
await finalTrainingLoss.selectColumns(["model", "trainLoss"]);
await finalTrainingLoss.logTable();

const results = sdb.newTable("results");
await results.loadData("models/**/validation.json");
await results.selectColumns(["model", "question", "score"]);
await results.summarize({
  values: "score",
  categories: ["model", "question"],
  summaries: "mean",
  decimals: 1,
  noColumnValue: true,
});
await results.logTable();

// Just to show the results in the console
const showResults = await results.cloneTable("showResults");
await showResults.wider("model", "mean");
await showResults.logTable("all");

await results.summarize({
  values: "mean",
  categories: "model",
  summaries: { overallScore: "sum" },
  decimals: 1,
  noColumnValue: true,
});
await results.updateColumn(
  "overallScore",
  `ROUND(overallScore / ${testQuestions.length}, 2)`,
);
await results.logTable();

const modelsTable = await sdb.newTable("modelsTable").loadArray(models);
await modelsTable.renameColumns({ name: "model" });
await modelsTable.logTable();

// We put everything together
const finalTable = await results.cloneTable("finalTable");
await finalTable.join(finalTrainingLoss);
await finalTable.join(modelsTable);
await finalTable.logTable();
await finalTable.writeChart(
  (data) =>
    plot({
      title: "Training loos vs Overall score",
      subtitle: "Size of the dot represents model size in number of parameters",
      r: {
        range: [2, 30],
      },
      grid: true,
      inset: 30,
      color: {
        legend: true,
      },
      marks: [
        dot(data, {
          x: "trainLoss",
          y: "overallScore",
          r: "size",
          stroke: "type",
          fill: "type",
          fillOpacity: 0.5,
        }),
        text(
          data,
          {
            x: "trainLoss",
            y: "overallScore",
            text: (d) => {
              const modelName = d.model.replace("-lora", "").replace(
                "-dora",
                "",
              ).replace(
                "-full",
                "",
              ).split("-").slice(0, -1).join("-");
              const modelSize = d.model.replace("-lora", "").replace(
                "-dora",
                "",
              ).replace(
                "-full",
                "",
              ).split("-").pop();
              return `${modelName}\n${modelSize}`;
            },
            stroke: "white",
            fill: "black",
          },
        ),
      ],
    }),
  "sda/output/finalTable.png",
);
console.log("Final table chart saved to sda/output/finalTable.png");

await sdb.done();
