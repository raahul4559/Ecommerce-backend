import { User } from "./user.model.js";
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const addressSchema = new mongoose.Schema({
    addressLine1:{
        type:String,
        require: true
    },
    addressLine2:{
        type:String,
    },
    city:{
        type:String,
        require:true
    },
    country:{
        type:String,
        require:true,
    },
    owner:{
        ref:"user",
        type: Schema.Types.ObjectId
    },
    pincode:{
        type:String,
        require: true,
    },
    state:{
        type:String,
        require:true,
    }


},{timestamps: true});

addressSchema.plugin(mongooseAggregatePaginate);

export const Address = mongoose.model("Address", addressSchema);