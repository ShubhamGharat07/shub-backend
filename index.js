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
  .connect("mongodb+srv://shubhchinu43:root123@cluster0.wqs3p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
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

// Update User API (PUT)
app.put("/user/:email", async (req, res) => {
  const { email } = req.params;
  const { fullname, mobileNumber } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the new mobile number is already in use by another user
    if (mobileNumber && mobileNumber !== user.mobileNumber) {
      const existingMobile = await User.findOne({ mobileNumber });
      if (existingMobile)
        return res.status(400).json({ message: "Mobile number already in use" });
    }

    // Update user fields if provided
    if (fullname) user.fullname = fullname;
    if (mobileNumber) user.mobileNumber = mobileNumber;

    // Save the updated user
    await user.save();

    // Respond with updated user data excluding the password
    const { password: _, ...userData } = user.toObject();
    res.status(200).json({ message: "User updated successfully", user: userData });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete User API (DELETE)
app.delete("/user/:email", async (req, res) => {
  const { email } = req.params;
  try {
    // Find and delete the user by email
    const user = await User.findOneAndDelete({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
