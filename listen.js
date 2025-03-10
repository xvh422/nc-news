const app = require("./app.js");

app.listen(9060, (err) => {
  if (err) {
    throw err;
  } else {
    console.log("listening at 9060");
  }
});
