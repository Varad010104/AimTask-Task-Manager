const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    title:{type:String,required:true},
    description:String,
    status:{type:String,enum:["pending","in-progress","completed"],default:"pending"},
    createdAt:{type:Date,default:Date.now},
    dueDate:Date,
    startTime:Date,
    priority:{type:String,enum:["low","medium","high"],default:"medium"},
    category:{type:String}, //Like Work,Study,Personal
})

module.exports = mongoose.model('Task',taskSchema);
