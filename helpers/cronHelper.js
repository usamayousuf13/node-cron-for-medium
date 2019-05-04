const nodemailer = require("nodemailer");
const schedule = require("node-schedule");
const fs = require("fs");
module.exports = {
  // checks the database (JSON object in this case) and delete if any duplicate exist
  async checkDuplicate(email) {
    let jsonOject = {
      jobs: []
    };

    // read database json file
    await fs.readFile("database.json", "utf8", async (err, data) => {
      if (err) {
        console.log("error in readfile in checkduplicate ", err);
        // write it back
        let json = JSON.stringify(jsonOject);

        await fs.writeFile("database.json", json, "utf8", err => {
          if (err) console.log("Error in append ", err);
          else console.log("Successfully created a new file");
        });
        return jsonOject;
      } else {
        // parse the json file to manipulate data
        jsonOject = JSON.parse(data);
        console.log("json object after reading -----> ", jsonOject);

        // initialize a variable jobsArray and store  objects inside jobs array
        let jobsArray = jsonOject.jobs;

        // loop through the jobsArray to check duplicate and replace
        for (index in jobsArray) {
          if (jobsArray[index].id === email) {
            jobsArray.splice(index, 1);
            console.log("Duplicate existed and removed");
            console.log("database after removing duplicate = ", jobsArray);
            // return the jsonObject after deletion
            return jsonOject;
          }
        }
        // if no duplicates are found, return the existing object to be used ahead
        return jsonOject;
      }
    });
  },

  // takes email, interval from req.body and jsonObject from checkDuplicate function and add new schedule to it
  async addNewSchedule(email, interval) {
    let jsonObject = {
      jobs: []
    };
    fs.readFile("database.json", "utf8", async (err, data) => {
      if (err) {
        console.log("error occurred while reading database file ", err);

        // initializing an object and pass stringified jsonObject into it
        let json = JSON.stringify(jsonObject);
        if (err.code === "ENOENT") {
          console.log("file not found. Creating a new one ... ");
          // creates a new database.json file. This is for the first time only
          await fs.writeFile("database.json", json, "utf8", err => {
            if (err) console.log("Error in writing file ", err);
            else console.log("Successfully created a new file");
            // calling function reccursively, once new file is created, else block will be called
            this.addNewSchedule(email, interval);
          });
        }
      } else {
        // parse the json file to manipulate data
        jsonOject = JSON.parse(data);
        console.log("json object after reading -----> ", jsonObject);
        // initialize a variable jobsArray and store  objects inside jobs array
        let jobsArray = jsonOject.jobs;
        // loop through the jobsArray to check duplicate and replace

        for (index in jobsArray) {
          if (jobsArray[index].id === email) {
            jobsArray.splice(index, 1);
          }
        }
        console.log("jsonOject after splice =====> ", jsonOject);

        // push new object in array (database) got through parameters
        jsonOject.jobs.push({ id: email, interval: interval });

        //convert it back to json
        let json = JSON.stringify(jsonOject);

        // write it back
        fs.writeFile("database.json", json, "utf8", err => {
          if (err) console.log("Error in append ", err);
          else console.log("Successfully added in database");
        });
      }
    });
  },

  // Send Email to customer on scheduled interval
  async startMonitoring(email, interval) {
    let setInterval;
    // Every sunday at 12:00am
    if (interval === "weekly") {
      setInterval = "0 0 * * 0";
    }
    // Everyday at 12:00am
    else if (interval === "daily") {
      setInterval = "0 0 * * *";
    }
    // Every hour
    else if (interval === "hourly") {
      setInterval = "* * * * *";
    } else {
      setInterval = "0 * * * *";
    }

    // Save schedule to the database

    //start schedule
    schedule.scheduleJob(email, setInterval, async () => {
      await this.sendEmail(email);
    });
  },

  // Run when monitoring is stopped (OFF) or Interval is changed
  async stopMonitoring(email) {
    // gets id of running job
    const schedule_id = email;

    // cancel the job
    console.log(" -> schedule id -> ", schedule_id);
    const cancelJob = schedule.scheduledJobs[schedule_id];
    if (cancelJob == null) {
      const message = "Job not found";
      console.log(message);
      return false;
    }
    console.log("cancel -> ", cancelJob);
    cancelJob.cancel();
    return true;
  },

  // send email at scheduled interval to the given email address
  async sendEmail(emailAddress) {
    console.log("sending email to ", emailAddress);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "yourEmailAddress@gmail.com",
        pass: "yourSecretPassword"
      }
    });

    const mailOptions = {
      from: "yourEmailAddress@gmail.com", // sender address
      to: emailAddress, // list of receivers
      subject: "Scheduled Magazine !!!", // Subject line
      html: "<p>Greetings from Awlo Fashion Magazine</p>" // plain text body
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.log(err);
      else console.log(info);
    });
  }
};
