import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
   userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
   name:{type:String,required:true},
   difficulty: {
     type: String,
     enum: ["beginner", "intermediate", "advanced"],
     default: "beginner"
   },
   titles:[
     {
      title:{type:String,required:true},
      order:{type:Number,required:true},
      difficulty: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
      },
      completed:{type:Boolean,default:false},
      unlocked:{type:Boolean,default:false},

      content:[
        {
          type:{type:String,enum:["text","code","example"],default:"text"},
          value:{type:String,required:true}
        }
      ],

      quiz:{
        questions:[
          {
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
            question:{type:String,required:true},
            options:[String],
            answer:{type:String,required:true}
          }
        ]
       }
     }
   ],
   generated:{type:Boolean,default:false},
   createdAt:{type:Date,default:Date.now}
});

export default mongoose.model("Topic",topicSchema);


