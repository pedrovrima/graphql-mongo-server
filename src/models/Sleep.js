import mongoose from "mongoose";

export const Sleep = mongoose.model("Sleep", { time:Number,type:String  });
