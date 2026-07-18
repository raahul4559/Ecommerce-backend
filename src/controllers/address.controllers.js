import { asyncHandler } from "../utils/asyncHandler.js"
import { AipError, ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { User } from "../models/user.model.js"
import { Address } from "../models/address.model.js"

const createAddress = asyncHandler(async (req, res) => {
    const { addressLine1,
        addressLine2,
        city,
        country,
        pincode,
        state } = req.body

    const owner = req.user._id

    const address = await Address.create({
        addressLine1,
        addressLine2,
        city,
        country,
        owner,
        pincode,
        state,
    });

    return res
        .status(200)
        .json(new ApiResponse(201, address, "Address Created Successfully"))
})

const getAllAddresses = asyncHandler(async (req, res) => {
    //
})

const getAddressById = asyncHandler(async (req, res) => {
    const {addressId} = req.params;
    const address = await Address.findOne({
        _id = addressId,
        owner:req.user._id,
    })

    if(!address){
        throw new AipError(400,"Address doesnot exist!")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,address,"Address fetched successfully"))
})

const updateAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const { addressLine1, addressLine2, pincode, city, state, country } =
        req.body;

    const address = await Address.findOneAndUpdate({
        _id: addressId,
        owner: req.user._id,
    }, {
        $set: {
            addressLine1,
            addressLine2,
            city,
            country,
            owner,
            pincode,
            state,
        }
    }, { new: true },
    )

    if (!address) {
        throw new ApiError(404, "Address doesnot exist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, address, "Address update successfully"))

});

const deleteAddress = asyncHandler(async (req, res)=>{
    const {addressId} = req.params
    const address = await Address.findOneAndDelete({
        _id:addressId,
        owner:req.user._id
    });

    if(!address){
        throw new ApiError(404,"Address not found")
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200, {deleteAddress:address},"Address delected successfully!!"))
})

export {
    createAddress,
    updateAddress,
    deleteAddress,
}