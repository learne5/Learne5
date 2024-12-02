import mongoose from 'mongoose';
import { Class } from '../models/class.model.js';
import { User } from '../models/user.model.js';
import { Lesson } from '../models/lesson.model.js';
import { Material } from '../models/material.model.js';
import { Resource } from '../models/resource.model.js';
import { Announcement } from '../models/announcement.model.js';

// const usedCodes = new Set();
// function generateRandomCode() {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let result = '';
//     for (let i = 0; i < 10; i++) {
//         result += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return result;
// }

// function getUniqueCode() {
//     let code;
//     do {
//         code = generateRandomCode();
//     } while (usedCodes.has(code));

//     usedCodes.add(code);
//     return code;
// }

const getClasses = async (req, res) => {
    try {
      const classCodes = req.body.codes;
  
      // Validate input
      if (!Array.isArray(classCodes) || classCodes.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid input: 'codes' must be a non-empty array.",
        });
      }
  
      // Find classes and filter out any that are not found
      const classes = (
        await Promise.all(
          classCodes.map(async (code) => {
            const reqClass = await Class.findOne({ code });
            return reqClass ? reqClass : null;
          })
        )
      ).filter(Boolean); // Remove null values
  
      if (classes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No classes found for the provided codes.",
        });
      }
  
      res.status(200).json({
        success: true,
        classes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
  


const insertClass = async (req, res) => {

    try {
        const { user, subject,code } = req.body;

        console.log('Extracted user and subject:', { user, subject });
        if (!user || !user._id || !subject) {
            throw new Error('Invalid user or subject data');
        }
        console.log('Creating new class with:', { teacher: user._id, subject, code });
        const newClass = new Class({
            teacher: user._id,
            subject: subject,
            code: code,
            students: [user._id]
        });
        console.log('New class created, attempting to save');
        const savedClass = await newClass.save();
        console.log('Class saved successfully:', savedClass);
        await User.findByIdAndUpdate(user._id, {
            $push: { classCodes: code }
        });

        res.status(201).json(savedClass);
    } catch (error) {
        console.error('Error in insertClass:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateClass = async (req, res) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json(updatedClass);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    };
}

const deleteClass = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const classId = req.params.id;
  
      // Find the class
      const deletedClass = await Class.findById(classId).session(session);
      if (!deletedClass) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }
  
      // Update users: remove the class code from students and teacher
      await User.updateMany(
        { _id: { $in: [...deletedClass.students, deletedClass.teacher] } },
        { $pull: { classCodes: deletedClass.code } },
        { session }
      );
  
      // Delete related lessons and resources
      const lessons = await Lesson.find({ class: classId }).session(session);
      const lessonIds = lessons.map((lesson) => lesson._id);
  
      await Resource.deleteMany({ lesson: { $in: lessonIds } }, { session });
      await Lesson.deleteMany({ class: classId }, { session });
  
      // Delete materials
      await Material.deleteMany({ class: classId }, { session });
  
      // Delete announcements
      if (deletedClass.announcements?.length) {
        await Announcement.deleteMany(
          { _id: { $in: deletedClass.announcements } },
          { session }
        );
      }
  
      // Delete the class
      await Class.findByIdAndDelete(classId, { session });
  
      // Commit transaction
      await session.commitTransaction();
      session.endSession();
  
      res.status(200).json({
        success: true,
        message: "Class and all related data deleted successfully",
      });
    } catch (error) {
      // Rollback transaction and end session on error
      await session.abortTransaction();
      session.endSession();
  
      console.error("Error deleting class and related data:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while deleting the class and related data",
      });
    }
  };
  

export { getClasses, insertClass, updateClass, deleteClass };
