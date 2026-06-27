import mongoose, { Schema } from "mongoose";
import {User} from "./user.model.js"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const categorySchema = new mongoose.Schema({

    name:{
        type:Sting,
        required:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
    
},{timestamps:true})

categorySchema.plugin(mongooseAggregatePaginate)

export const Category = mongoose.model("Category",categorySchema)