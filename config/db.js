const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const DB_URL = process.env.DB_URL;

let connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
        })
        console.log('✔ Connection successful')
    }catch(err){
        console.error(err);
        console.log('🤦‍♂️ Connection Not Established')
    }
}

module.exports = connectDB;