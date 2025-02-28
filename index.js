const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/AroundMeSale")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: Number, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);



// app.post("/register", async (req, res) => {
//   const { fullname, email, mobileNumber, password } = req.body;
//   try {
//     // Check if the user already exists with the same email
//     const existingUser = await User.findOne({ email });
//     if (existingUser)
//       return res.status(400).json({ message: "User with this email already exists" });

//     // Check if there is already a user with the same mobile number
//     const existingMobile = await User.findOne({ mobileNumber });
//     if (existingMobile)
//       return res.status(400).json({ message: "User with this mobile number already exists" });

//     // Hash the password before saving
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user
//     const newUser = new User({
//       fullname,
//       email,
//       mobileNumber,
//       password: hashedPassword,
//     });

//     // Save the new user to the database
//     await newUser.save();

//     // Respond with success
//     res.status(201).json({ message: "User registered successfully", user: newUser });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });


// // Login API
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(400).json({ message: "Invalid credentials" });

//     res.status(200).json({ message: "Login successful", user });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// Start Server

// Register API
app.post("/register", async (req, res) => {
  const { fullname, email, mobileNumber, password } = req.body;
  try {
    // Check if the user already exists with the same email
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User with this email already exists" });

    // Check if there is already a user with the same mobile number
    const existingMobile = await User.findOne({ mobileNumber });
    if (existingMobile)
      return res.status(400).json({ message: "User with this mobile number already exists" });

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      fullname,
      email,
      mobileNumber,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();

    // Respond with success, sending user data excluding the password
    const { password: _, ...userData } = newUser.toObject(); // Exclude password
    res.status(201).json({ message: "User registered successfully", user: userData });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login API
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Respond with success, sending user data excluding the password
    const { password: _, ...userData } = user.toObject(); // Exclude password
    res.status(200).json({ message: "Login successful", user: userData });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
