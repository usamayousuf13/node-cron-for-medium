const nodemailer = require("nodemailer");
const schedule = require("node-schedule");
const fs = require("fs");
module.exports = {
  /*
  Add a new schedule to database.json when a customer submit data
  takes email, interval from req.body and jsonObject from checkDuplicate function and add new schedule to it
  */
  async addNewSchedule(email, interval) {
    let jsonObject = {
      jobs: []
    };
    fs.readFile("database.json", "utf8", async (err, data) => {
      if (err) {
        console.log("error occurred while reading database file ", err);

        // initializing an object and pass stringified jsonObject into it
        let json = JSON.stringify(jsonObject);

        // if error is related to "file not found"
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

        // initialize a variable jobsArray and store  objects inside jobs array
        let jobsArray = jsonOject.jobs;

        // loop through the jobsArray to check duplicate and replace
        for (index in jobsArray) {
          if (jobsArray[index].id === email) {
            jobsArray.splice(index, 1);
          }
        }

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

  /*
  Starts monitoring. Uses npm node-schedule package scheduleJob() function to schedule cron jobs
  based on the interval provided through parameters
  
  */
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
      setInterval = "0 * * * *";
    } else {
      setInterval = "0 * * * *";
    }

    /*
    starts schedule. 
    1st parameter is the unique_id that identifies the job. I am using user email as a unique id
    2nd parameter is the interval set above
    in function body, you can write any thing that you want to perform as a cron job. I am calling
    a function that sends an email to user on every interval selected
*/
    schedule.scheduleJob(email, setInterval, async () => {
      await this.sendEmail(email);
    });
  },

  // Stops a scheduled job when ever selected unsubscribed or interval is modified
  async stopMonitoring(email) {
    // gets id of running job
    const schedule_id = email;

    // cancel the job
    const cancelJob = schedule.scheduledJobs[schedule_id];
    if (cancelJob == null) {
      return false;
    }
    cancelJob.cancel();
    return true;
  },

  // send email at scheduled interval to the given email address
  async sendEmail(emailAddress) {
    console.log("sending email to ", emailAddress);
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: "yourEmailAddress@gmail.com",
    //     pass: "yourSecretPassword"
    //   }
    // });

    // const mailOptions = {
    //   from: "yourEmailAddress@gmail.com", // sender address
    //   to: emailAddress, // list of receivers
    //   subject: "Scheduled Magazine !!!", // Subject line
    //   html: "<p>Greetings from Awlo Fashion Magazine</p>" // plain text body
    // };

    // transporter.sendMail(mailOptions, (err, info) => {
    //   if (err) console.log(err);
    //   else console.log(info);
    // });
  }
};
