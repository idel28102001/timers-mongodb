const timers = require("./timers");
const { getAll } = require("./logs");

const { ObjectId } = require("mongodb");
const { sort } = require("nunjucks/src/filters");

const addTimerEvents = (app) => {
  app.get("/api/timers", getAll(), (req, res) => {
    if (req.query.isActive === "true") {
      const allElems = req.timers.isActive;
      timers.changeTic(req.db, allElems);
      res.send(allElems);
    } else {
      res.send(req.timers.notActive);
    }
  });

  app.post(`/api/timers/:id/stop`, getAll(), async (req, res) => {
    const { progress } = await req.db
      .collection("timers")
      .findOne({ _id: ObjectId(req.params.id) }, { projection: { progress: 1 } });
    await req.db.collection("timers").findOneAndUpdate(
      { _id: ObjectId(req.params.id) },
      {
        $set: { isActive: false, end: Date.now(), duration: progress },
      }
    );
  });

  app.post("/api/timers", getAll(), async (req, res) => {
    if (req.db) {
      const elem = timers.createTimer(req.body.description);
      elem.userId = req.userId;
      const { _id } = await req.db.collection("timers").insertOne(elem);
      res.send({ _id });
    }
  });
};

module.exports = addTimerEvents;
