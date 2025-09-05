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

// In seconds
const trainingDurations = [{
  model: "gemma-3-270m",
  duration: 105,
}, {
  model: "gemma-3-1b",
  duration: 314,
}, {
  model: "llama-3.2-1b",
  duration: 496,
}, {
  model: "llama-3.2-3b",
  duration: 1050,
}, {
  model: "gemma-3-4b",
  duration: 1205,
}, {
  model: "llama-3.1-8b",
  duration: 2186,
}, {
  model: "llama-3.1-12b",
  duration: 3159,
}, {
  model: "llama-3.1-27b",
  duration: 6625,
}];

const sdb = new SimpleDB();

const durations = sdb.newTable("durations");
await durations.loadArray(trainingDurations);
await durations.writeChart((data) =>
  plot({
    x: {
      ticks: 0,
      label: null,
    },
    marginLeft: 125,
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
        text: (d) =>
          `${Math.floor(d.duration / 60)} min ${d.duration % 60} sec`,
        fill: "black",
        textAnchor: "start",
        dx: 5,
      }),
    ],
  }), "results-data/durations.png");
await durations.logTable();

// Training loss results
const trainingLoss = await sdb.newTable("trainingLoss").loadData(
  "results-data/*.json",
);
await trainingLoss.replace("model", {
  "-it-qat-4bit": "",
  "-it-4bit": "",
  "-Instruct-4bit": "",
});
await trainingLoss.writeChart((data) =>
  plot({
    y: {
      type: "log",
      tickFormat: (d) => d,
    },
    grid: true,
    inset: 10,
    marginRight: 100,
    height: 600,
    marks: [
      line(data, {
        x: "iteration",
        y: "trainLoss",
        stroke: "model",
        curve: "catmull-rom",
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
  }), "results-data/trainLoss.png");

await trainingLoss.logTable();

await sdb.done();
