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

const toReplace = {
  "mlx-community/": "",
};

const sdb = new SimpleDB();

const durations = sdb.newTable("durations");
await durations.loadData("results-data/durations.json");
await durations.replace("model", toReplace);
await durations.updateColumn("duration", `ROUND(duration / 1000)`); // Convert ms to sec
await durations.writeChart((data) =>
  plot({
    x: {
      ticks: 0,
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
  "results-data/trainLoss.json",
);
await trainingLoss.removeMissing({ columns: ["trainLoss"] });
await trainingLoss.replace("model", toReplace);
await trainingLoss.writeChart((data) =>
  plot({
    y: {
      type: "log",
      tickFormat: (d) => d,
    },
    grid: true,
    inset: 10,
    marginRight: 175,
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
