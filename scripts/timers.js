const stopTimer = (elem) => {
  console.log(elem);
  elem.isActive = false;
  elem.end = Date.now();
  elem.duration = elem.progress;
};

const createTimer = (description) => {
  return { start: Date.now(), description, isActive: true, progress: 0 };
};

const changeTic = (db, elems) => {
  db.collection("timers").updateMany({ _id: { $in: elems.map((e) => e._id) } }, { $inc: { progress: 1000 } });
};

module.exports = { stopTimer, createTimer, changeTic };
