import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },

  lessonId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
  order: { type: Number, required: true }, 
  
  answers:[
      {
        questionId:mongoose.Schema.Types.ObjectId,
        isCorrect:Boolean

      }
  ],
  timespent:{type:Number},
  score: { type: Number, default: 0 },   
  completed: { type: Boolean, default: false }, 
  recommendations:[
    {
      _id:{type:mongoose.Schema.Types.ObjectId,auto:true},
      title:String,
      reason:String,
      order:{type:Number},
      content:String,
      quiz:[
        {
          question:String,
          options:[String],
          answerIndex:Number
        }
      ],
      pass:{type:Boolean,default:false},
      tried:{type:Number,default:0},
      score:{type:Number,default:0},
      generatedAt:{type:Date,default:Date.now()}
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("UserProgress", userProgressSchema);
