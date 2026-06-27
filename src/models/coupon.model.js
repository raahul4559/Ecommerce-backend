import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { AvailableCouponTypes, CouponTypeEnum} from "../../constant";

const couponSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    couponCode:{
        type:String,
        require:true,
        unique:true,
        trim:true,
        uppercase:true,
    },
    type:{
        type:String,
        enum:AvailableCouponType,
        default:CouponTypeEnum.FLAT,

    },
    discount:{
        type:Number,
        require:true,
    },
    isActive:{
        type:Boolean,
        default:true,
    },
    minimumCart:{
        type:Number,
        default:0,
    },
    startDate:{
        type:Date,
        default:Date.now()
    },
    expiryDate:{
        type:Date,
        default:null
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }


},{timestamps:true})

couponSchema.plugin(mongooseAggregatePaginate)

export const Coupon = mongoose.model("Coupon",couponSchema)