//Importing required packages
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

//Creating my express app
const app = express();

// Connecting mongodb to my app
mongoose.connect(
  "mongodb+srv://Shawn102:221298@todolist.5uievwj.mongodb.net/myOwntodoDB"
);

//Setting 'ejs' module to my app
app.set("view engine", "ejs");

//Using 'bodyParser' to access html page inputs
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("css"));

// Creating a Schema for my home route to save all the user notes on mongo db
const itemsSchema = new mongoose.Schema({
  name: String,
});
// Creating a model using "itemsSchema"
const Item = mongoose.model("item", itemsSchema);

// Creating a custom list Schema
const listsSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});
// Creating a model using "listsSchema"
const List = mongoose.model("list", listsSchema);

//Setting the 1st home route to interact with my server
app.get("/", (req, res) => {
  Item.find({}, (err, foundItem) => {
    res.render("list", { listTitle: "Today", newListItems: foundItem });
  });
});

app.post("/", (req, res) => {
  const inputItem = req.body.txt;
  const listName = req.body.button;

  const item = new Item({
    name: inputItem,
  });

  if (listName === "Today") {
    item.save().then(() => res.redirect("/"));
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save().then(() => res.redirect("/" + listName));
    });
  }
});

// Creating a custom route using url params
app.get("/:customListName", (req, res) => {
  const customListName = req.params.customListName;

  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: [],
        });
        list.save().then(() => res.redirect("/" + customListName));
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

// Handling the delete route
app.post("/delete", (req, res) => {
  const checkId = req.body.checkbox;
  const listTitle = req.body.hiddenTitle;

  if (listTitle === "Today") {
    Item.findByIdAndRemove({ _id: checkId }, (err) => {
      if (!err) {
        console.log(
          "Successfully deleted the item from the Item collection of your DB!"
        );
      } else {
        console.log(err);
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listTitle },
      { $pull: { items: { _id: checkId } } },
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(
            "Successfully deleted the item from List collection of your DB."
          );
        }
      }
    );
    res.redirect("/" + listTitle);
  }
});

app.get("/about", (req, res) => {
  res.render("about");
});

//Declaring a variable for my port
let port = process.env.PORT;

if(port == null || port == "") {
  port = 4000;
}

//Creating my server

app.listen(port, () => {
  console.log(`Your app started on port ${port}`);
});
