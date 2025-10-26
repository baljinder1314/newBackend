import { app } from "./app.js";
import db_connection from "./db/db_connection.js";
import dotenv from "dotenv";


dotenv.config({ path: "./.env" });


db_connection()
  .then(() => {
    app.on("error", (err) => {
      console.log(`App is not listing ${err}`);
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Serer is listen at http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Mongodb connection failed: ${err}`);
  });
