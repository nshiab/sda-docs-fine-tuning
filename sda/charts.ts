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

const sdb = new SimpleDB();

const durations = sdb.newTable("durations");
await durations.loadData("models/**/duration.json");
await durations.updateColumn("duration", `ROUND(duration / 1000)`); // Convert ms to sec
await durations.logTable();
await durations.writeChart((data) =>
  plot({
    x: {
      ticks: 0,
      label: null,
    },
    y: {
      label: null,
    },
    marginLeft: 175,
    marginRight: 100,
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
await trainingLossOverTime.logTable();
await trainingLossOverTime.writeChart((data) =>
  plot({
    grid: true,
    inset: 10,
    marginRight: 175,
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
await finalTrainingLoss.logTable();
await finalTrainingLoss.writeChart((data) =>
  plot({
    x: {
      ticks: 0,
      label: null,
    },
    y: {
      label: null,
    },
    marginLeft: 175,
    marginRight: 100,
    marks: [
      barX(data, {
        y: "model",
        x: "trainLoss",
        fill: "orange",
        sort: {
          y: "x",
        },
      }),
      textX(data, {
        x: "trainLoss",
        y: "model",
        text: "trainLoss",
        fill: "black",
        textAnchor: "start",
        dx: 5,
      }),
    ],
  }), "sda/output/finalTrainingLoss.png");
console.log(
  "Final training loss chart saved to sda/output/finalTrainingLoss.png",
);

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
});
await results.logTable();
await results.writeChart((data) =>
  plot({
    x: {
      ticks: 0,
      label: null,
    },
    y: {
      label: null,
    },
    marginLeft: 175,
    marginRight: 100,
    marks: [
      barX(data, {
        y: "model",
        x: "overallScore",
        fill: "orange",
        sort: {
          y: "x",
        },
      }),
      textX(data, {
        x: "overallScore",
        y: "model",
        text: "overallScore",
        fill: "black",
        textAnchor: "start",
        dx: 5,
      }),
    ],
  }), "sda/output/results.png");
console.log(
  "Results chart saved to sda/output/results.png",
);
await sdb.done();
