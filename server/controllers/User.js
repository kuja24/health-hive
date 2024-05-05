import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createError } from "../error.js";
import User from "../models/User.js";
import Workout from "../models/Workout.js";

dotenv.config();

export const SignUp = async(req, res, next) => {
    try {
        const {email, password, name, img } = req.body;
        const existingUser = await User.findOne({email}).exec();
        console.log(existingUser);
        if(existingUser) {
            return next(createError(409, "Email is already in use"));
        }
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const user = new User({
            name, email,
            password: hashedPassword,
            img
        })

        const createdUser = await user.save();

        const token = jwt.sign({ id: createdUser._id }, process.env.SECRET, {
            expiresIn: "5 hours",
          });
          console.log(createdUser)
          
        return res.status(200).json({ token, user });
    } catch (err) {
        next(err)
    }
}

export const SignIn = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email: email });
      // Check if user exists
      if (!user) {
        return next(createError(404, "User not found"));
      }
      console.log(user);
      // Check if password is correct
      const isPasswordCorrect = await bcrypt.compareSync(password, user.password);
      if (!isPasswordCorrect) {
        return next(createError(403, "Incorrect password"));
      }
  
      const token = jwt.sign({ id: user._id }, process.env.SECRET, {
        expiresIn: "5 hours",
      });
  
      return res.status(200).json({ token, user });
    } catch (error) {
      return next(error);
    }
  };

  export const getDashboard = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const user = await User.findById(userId);
      if (!user) {
        return next(createError(404, "User not found"));
      }
  
      const todaysDate = new Date();
      const startDate = new Date(
        todaysDate.getFullYear(),
        todaysDate.getMonth(),
        todaysDate.getDate()
      );
      const endDate = new Date(
        todaysDate.getFullYear(),
        todaysDate.getMonth(),
        todaysDate.getDate() + 1
      );
  
      //evaluate sum of calories burned for the day
      const sumOfCaloriesBurnt = await Workout.aggregate([
        { $match: { user: user._id, date: { $gte: startDate, $lt: endDate } } },
        {
          $group: {
            _id: null,
            totalCaloriesBurnt: { $sum: "$caloriesBurned" },
          },
        },
      ]);
  
      //evaluate total workouts
      const totalWorkouts = await Workout.countDocuments({
        user: userId,
        date: { $gte: startDate, $lt: endDate },
      });
  
      //compute calories burned in each workout done that day
      const avgCaloriesBurntPerWorkout =
        sumOfCaloriesBurnt.length > 0
          ? sumOfCaloriesBurnt[0].totalCaloriesBurnt / totalWorkouts
          : 0;
  
      // Fetch category of workouts
      const categoryCalories = await Workout.aggregate([
        { $match: { user: user._id, date: { $gte: startDate, $lt: endDate } } },
        {
          $group: {
            _id: "$category",
            totalCaloriesBurnt: { $sum: "$caloriesBurned" },
          },
        },
      ]);
  
      //calculate data to create pie chart
  
      const pieChartData = categoryCalories.map((category, index) => ({
        id: index,
        value: category.totalCaloriesBurnt,
        label: category._id,
      }));
  
      const weeks = [];
      const caloriesBurnt = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(
          todaysDate.getTime() - i * 24 * 60 * 60 * 1000
        );
        weeks.push(`${date.getDate()}th`);
  
        const startOfDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        const endOfDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 1
        );
  
        const weekData = await Workout.aggregate([
          {
            $match: {
              user: user._id,
              date: { $gte: startOfDay, $lt: endOfDay },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              totalCaloriesBurnt: { $sum: "$caloriesBurned" },
            },
          },
          {
            $sort: { _id: 1 }, 
          },
        ]);
        //push to final array
        caloriesBurnt.push(
          weekData[0]?.totalCaloriesBurnt ? weekData[0]?.totalCaloriesBurnt : 0
        );
      }
  
      //return in required format to be able to diaplay on UI
      return res.status(200).json({
        totalCaloriesBurnt:
          sumOfCaloriesBurnt.length > 0
            ? sumOfCaloriesBurnt[0].totalCaloriesBurnt
            : 0,
        totalWorkouts: totalWorkouts,
        avgCaloriesBurntPerWorkout: avgCaloriesBurntPerWorkout,
        totalWeeksCaloriesBurnt: {
          weeks: weeks,
          caloriesBurned: caloriesBurnt,
        },
        pieChartData: pieChartData,
      });
    } catch (err) {
      next(err);
    }
  };
  
  export const filterWorkoutByDate = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const user = await User.findById(userId);
      let date = req.query.date ? new Date(req.query.date) : new Date();
      if (!user) {
        return next(createError(404, "User not found"));
      }
      //filter criteria -start day
      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      //filter criteria -end day
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );
  
      const todaysWorkouts = await Workout.find({
        userId: userId,
        date: { $gte: startOfDay, $lt: endOfDay },
      });
      const totalCaloriesBurnt = todaysWorkouts.reduce(
        (total, workout) => total + workout.caloriesBurned,
        0
      );
  
      return res.status(200).json({ todaysWorkouts, totalCaloriesBurnt });
    } catch (err) {
        console.log(err);
      next(err);
    }
  };
  
  export const createNewWorkout = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const { workoutString } = req.body;
      if (!workoutString) {
        return next(createError(400, "Workout string is missing"));
      }
      const eachworkout = workoutString.split(";").map((line) => line.trim());
      const categories = eachworkout.filter((line) => line.startsWith("#"));
      if (categories.length === 0) {
        return next(createError(400, "No categories found in workout string"));
      }
  
      const parsedWorkouts = [];
      let currentCategory = "";
      let count = 0;
  
      // Loop through each line to parse workout details
      await eachworkout.forEach((line) => {
        count++;
        if (line.startsWith("#")) {
          const parts = line?.split("\n").map((part) => part.trim());
          console.log(parts);
          if (parts.length < 5) {
            return next(
              createError(400, `Workout string is missing for ${count}th workout`)
            );
          }
  
          // fetch category of workout from workoutString
          currentCategory = parts[0].substring(1).trim();
          // fetch category of workout from workoutString
          const workoutDetails = extractWorkoutDetails(parts);
          if (workoutDetails == null) {
            return next(createError(400, "Please enter in proper format "));
          }
  
          if (workoutDetails) {
            // Add category to workout details
            workoutDetails.category = currentCategory;
            parsedWorkouts.push(workoutDetails);
          }
        } else {
          return next(
            createError(400, `Workout string is missing for ${count}th workout`)
          );
        }
      });
  
      // persist workout
      await parsedWorkouts.forEach(async (workout) => {
        await Workout.create({ ...workout, user: userId });
      });
  
      return res.status(201).json({
        message: "Added workout in DB",
        workouts: parsedWorkouts,
      });
    } catch (err) {
      next(err);
    }
  };
  
  // extract workout details
  const extractWorkoutDetails = (parts) => {
    const details = {};
    console.log("----parts")
    console.log(parts);
    if (parts.length >= 5) {
      details.workoutName = parts[1].substring(1).trim();
      console.log("workout name")
      console.log(details.workoutName)
      details.sets = parseInt(parts[2].split("sets")[0].substring(1).trim());
      details.reps = parseInt(
        parts[2].split("sets")[1].split("reps")[0].substring(1).trim()
      );
      details.weight = parseFloat(parts[3].split("kg")[0].substring(1).trim());
      details.duration = parseFloat(parts[4].split("min")[0].substring(1).trim());
      console.log("=====caloeris")
      console.log(parseFloat(parts[5].split("cal")[0].substring(1).trim()))
      details.caloriesBurned = parseFloat(parts[5].split("cal")[0].substring(1).trim())
      console.log(details);
      return details;
    }
    return null;
  };
  

  