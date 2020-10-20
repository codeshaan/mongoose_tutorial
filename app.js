const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

// mongoDB connection here
mongoose.connect(process.env.DBURI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (err) => console.log(err));
db.once("open", () => console.log("Connected to DB!!"));

// including body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// setting handlebars
const exphbs = require("express3-handlebars").create({
	defaultLayout: "main",
	helpers: {
		section: function (value, options) {
			if (!this.section) this.section = {};

			this.section[value] = options.fn(this);
			return null;
		},
	},
});

app.engine("handlebars", exphbs.engine);
app.set("view engine", "handlebars");

// creating a schema
const StudentSchema = new mongoose.Schema({
	name: String,
	roll: Number,
});

const Student = mongoose.model("Student", StudentSchema);

// routes
app.get("/", (req, res) => {
	Student.find((err, students) => {
		res.render("index", {
			title: "Home Page",
			students: students,
		});
	});
});

// get the whole api
app.get("/api", (req, res) => {
	Student.find((err, students) => {
		if (err) return console.log(err);

		res.json(students);
	});
});

// get a specific api record
app.get("/api/:id", (req, res) => {
	Student.find({ _id: req.params.id }, (err, students) => {
		if (err) return console.log(err);
		res.json(students);
	});
});

// to get the details fromt the form
app.post("/process", (req, res) => {
	if (!req.body.name || !req.body.roll) {
		res.redirect("/");
		return;
	}

	const student = new Student({ name: req.body.name, roll: req.body.roll });

	student.save((err, student) => {
		if (err) return console.log(err);

		res.redirect("/");
	});
});

// get a student detail
app.get("/student/:id", (req, res) => {
	Student.findById(req.params.id, (err, student) => {
		res.render("student", {
			title: student.name,
			student: student,
		});
	});
});

// delete a student
app.get("/delete/:id", (req, res) => {
	Student.deleteOne({ _id: req.params.id }, (err) => {
		if (err) return console.log(err);
		res.redirect("/");
	});
});

// edit a student details
app.get("/edit/:id", (req, res) => {
	Student.findById(req.params.id, (err, student) => {
		if (err) return console.log(err);

		res.render("edit", {
			title: "Edit Page",
			student: student,
		});
	});
});

// saving changes
app.post("/edit_student/:id", (req, res) => {
	Student.updateOne(
		{ _id: req.params.id },
		{ $set: { name: req.body.name, roll: req.body.roll } },
		{},
		(err) => {
			if (err) return console.log(err);

			res.redirect("/");
		}
	);
});

app.listen(3000, () =>
	console.log("The server is up and running on port 3000")
);
