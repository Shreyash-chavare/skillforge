import jwt from "jsonwebtoken";
import User from "../Models/user.js";
import bcrypt from "bcryptjs";
import tokenuser from "../utils/Token.js";
import Topic from "../Models/UserTopic.js";
import UserProgress from "../Models/Userprogress.js";

export const registeruser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `User with email ${email} already exists`,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const usercreate = await User.create({
      name,
      email,
      password: hash,
    });

    const token = tokenuser(usercreate);

    res.cookie("user-token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: usercreate._id,
        email: usercreate.email,
        name: usercreate.name,
        preferences: usercreate.preferences,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const loginuser = async (req, res) => {
  console.log("LOGIN ROUTE HIT");

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const secret =
      process.env.JWT_TOKEN || "dev-secret-skillforge";

    const token = tokenuser(user)

    res.cookie("user-token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fields, topicDifficulties } = req.body; // topicDifficulties: { "Java": "intermediate", "Python": "beginner" }

    // Get current user to compare old and new fields
    const currentUser = await User.findById(userId);
    const oldFields = currentUser.preferences?.fields || [];
    const newFields = fields || [];
    const difficulties = topicDifficulties || {}; // Map of topic name to difficulty

    // Update user preferences (only fields, difficulty is now per-topic)
    const updated = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "preferences.fields": fields,
        },
      },
      { new: true }
    );

    // Sync topics with preferences
    // 1. Get existing topics for this user
    const existingTopics = await Topic.find({ userId });
    const existingTopicNames = existingTopics.map(t => t.name.toLowerCase());

    // 2. Create topics for new fields that don't exist
    // Each topic gets its own independent difficulty from topicDifficulties or default: beginner
    const newFieldsLower = newFields.map(f => f.toLowerCase());
    for (const field of newFields) {
      const fieldLower = field.toLowerCase();
      if (!existingTopicNames.includes(fieldLower)) {
        // Get difficulty from topicDifficulties map, or default to beginner
        const difficulty = difficulties[field] || difficulties[fieldLower] || "beginner";
        
        // Validate difficulty
        const validDifficulties = ["beginner", "intermediate", "advanced"];
        const finalDifficulty = validDifficulties.includes(difficulty.toLowerCase()) 
          ? difficulty.toLowerCase() 
          : "beginner";
        
        // Create new topic with specified difficulty
        await Topic.create({
          userId,
          name: field,
          difficulty: finalDifficulty,
          generated: false,
          titles: []
        });
        console.log(`Created new topic: ${field} for user ${userId} with difficulty: ${finalDifficulty}`);
      }
    }

    // 3. Delete topics for fields that were removed
    const oldFieldsLower = oldFields.map(f => f.toLowerCase());
    for (const topic of existingTopics) {
      const topicNameLower = topic.name.toLowerCase();
      if (!newFieldsLower.includes(topicNameLower)) {
        // Delete associated progress first (to avoid orphaned references)
        await UserProgress.deleteMany({ userId, topic: topic._id });
        // Then delete the topic
        await Topic.deleteOne({ _id: topic._id });
        console.log(`Deleted topic: ${topic.name} and its progress for user ${userId}`);
      }
    }

    res.json({
      success: true,
      message: "Preferences updated",
      preferences: updated.preferences,
    });
  } catch (err) {
    console.error("Preference update error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
