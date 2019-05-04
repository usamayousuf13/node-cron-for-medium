const express = require("express");
const router = express.Router();
const helper = require("../helpers/cronHelper");
/* GET home page. */
router.get("/", async (req, res) => {
  res.render("index", { title: "Express" });
});

router.post("/schedule", async (req, res) => {
  const { email, interval } = req.body;
  console.log("email & interval ", email, interval);

  console.log("stopping previous monitoring .... ");
  await helper.stopMonitoring(email);

  console.log("adding new schedule to database .... ");

  await helper.addNewSchedule(email, interval);
  console.log("starting monitoring for new schedule .... ");
  if (interval != "unsubscribe") await helper.startMonitoring(email, interval);

  res.render("success", {
    layout: false,
    data: { email: email, interval: interval }
  });
});

module.exports = router;
