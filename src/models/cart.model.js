import { User } from "./user.model.js";
import mongoose, { Schema } from "mongoose";
import { Product } from "./product.models.js";
import { Coupon } from "./coupon.model.js";

const cartSchema = new mongoose.Schema({

    owner:{
        ref:"user",
        type: Schema.Types.ObjectId,
    },
    items:{
        type:[{
            productId:{
                type:Schema.Types.ObjectId,
                ref:"product"
            },
            quality:{
                type:Number,
                require:true,
                min:[1,'Quality cannot be less than 1'],
                default:1
            }
        }],
        default:[],
    },
    coupon:{
        type:Schema.Types.ObjectId,
        ref:"Coupon",
        default:null,
    },


},{timestamps:true})

export const Cart = mongoose.model("Cart",cartSchema);