const mongoose =require("mongoose")

module.exports=  Sleep = mongoose.model("Sleep", { time:Number,type:String  });
