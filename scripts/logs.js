const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const findUserByUserName = async (db, username, res) => {
  try {
    return await db.collection("users").findOne({ username });
  } catch (err) {
    console.error(err.message);
    return res.redirect("/?authError=true");
  }
};

const findUserBySessionId = async (db, sessionId) => {
  const session = await db.collection("sessions").findOne({ sessionId }, { projection: { userId: 1 } });
  if (session) return db.collection("users").findOne({ _id: ObjectId(session.userId) });
};

const createSession = async (db, userId) => {
  const sessionId = nanoid();
  await db.collection("sessions").insertOne({ userId, sessionId });
  return sessionId;
};

const deleteSession = async (db, sessionId, res) => {
  try {
    await db.collection("sessions").deleteOne({ sessionId });
  } catch (err) {
    console.error(err);
    return res.redirect("/");
  }
};

const createUser = async (username, password) => {
  const pass = await bcrypt.hash(password, 10);
  return { username, password: pass };
};

const updateUsers = async (db, username1, password1, res) => {
  const { username, password } = await createUser(username1, password1);
  const user = await db.collection("users").findOne({ username }, { projection: { username: 1 } });
  if (!user) {
    await db.collection("users").insertOne({ username, password });
    res.redirect("/?signSuccess=true");
  } else {
    res.redirect("/?signError=true");
  }
};

const getTimers = async (db, userId) => {
  let isActive = await db
    .collection("timers")
    .find({ userId: ObjectId(userId), isActive: true })
    .toArray();
  let notActive = await db
    .collection("timers")
    .find({ userId: ObjectId(userId), isActive: false })
    .toArray();
  return { isActive, notActive };
};
const auth = () => async (req, res, next) => {
  if (!req.cookies["sessionId"]) {
    return next();
  }
  const user = await findUserBySessionId(req.db, req.cookies["sessionId"]);
  if (!user) {
    return next();
  }
  req.user = user;
  req.sessionId = req.cookies["sessionId"];
  next();
};

const getAll = () => async (req, res, next) => {
  if (!req.cookies["sessionId"]) {
    return next();
  }
  const user = await findUserBySessionId(req.db, req.cookies["sessionId"]);
  if (user) {
    req.userId = user._id;
    req.timers = await getTimers(req.db, user._id);
  }
  next();
};

module.exports = {
  findUserByUserName,
  findUserBySessionId,
  createSession,
  deleteSession,
  auth,
  updateUsers,
  getAll,
  bcrypt,
};
