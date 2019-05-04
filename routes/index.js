const express = require("express");
const router = express.Router();
const helper = require("../helpers/cronHelper");

/* GET home page. */
router.get("/", async (req, res) => {
  res.render("index", { title: "Awlo Magazine" });
});

router.post("/schedule", async (req, res) => {
  // grab email address that customer entered and the interval selected
  const { email, interval } = req.body;

  //stopping previous schedules if exist
  await helper.stopMonitoring(email);

  // adds new schedule to database ....
  await helper.addNewSchedule(email, interval);

  // if selected interval is not to unsubscrive then start monitoring for new schedule
  if (interval != "unsubscribe") await helper.startMonitoring(email, interval);

  res.render("success", {
    layout: false,
    data: { email: email, interval: interval }
  });
});

module.exports = router;
