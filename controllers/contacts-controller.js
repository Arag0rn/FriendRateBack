import { contactAddSchema, contactUpdateSchema, ContactFavoriteSchema } from "../schemas/contacts-schema.js";
import fs from "fs/promises";
import path from "path";

import Contact from "../models/Contact.js";

import {HttpError} from "../helpers/index.js"

import { ctrlWrapper } from "../decorators/index.js";

const postersPath = path.resolve("public", "avatar");



const getAllContacts = async (req, res, next) => {
   const {_id: owner} = req.user;
   const {page = 1, limit = 10}= req.query;
   const skip = (page - 1) * limit;
    const result = await Contact.find({owner}, "-createdAt -updatedAt", {skip, limit }).populate("owner", "username email");
    res.json(result)
 }


const getByID = async (req, res, next) => {

    const {contactId} = req.params;
    const {_id: owner} = req.user;
    const result = await Contact.findOne({_id:contactId, owner});
    if(!result){
        throw HttpError (404, `Contact with id=${contactId} not found`);
    }
    res.json(result);

}


const add = async (req, res, next) => {
    const {_id: owner} = req.user;
    const {path: oldPath, filename} = req.file;
    const newPath = path.join(postersPath, filename);
    console.log(oldPath);
    console.log(newPath);
 
    await fs.rename(oldPath, newPath);

    const avatar = path.join("avatar", filename )
    const result = await Contact.create({...req.body, avatar, owner});

    res.status(201).json(result);


}


const updateById = async (req, res) => {
    const { contactId } = req.params;
    const {_id: owner} = req.user;
    const result = await Contact.findOneAndUpdate({_id: contactId, owner}, req.body);
    if (!result) {
        throw HttpError(404, `Contact with id=${contactId} not found`);
    }

    res.json(result);
}

const deleteById = async (req, res) => {
    const { contactId } = req.params;
    const {_id: owner} = req.user;
    const result = await Contact.findOneAndDelete({_id: contactId, owner});

    if (!result) {
        throw HttpError(404, `Contact with id=${contactId} not found`);
    }

    // res.status(204).send();

    res.json({
        message: "Delete success"
    })
}

const updateStatusContact  = async(req, res, next)=>{
    try {
       const {error} = contactUpdateSchema.validate(req.body);
       if (error){
           throw HttpError(400, error.message);
       }
       const {contactId} = req.params;
       const result = await Contact.findByIdAndUpdate(contactId, req.body);
       if(!result){
           throw HttpError (404, `Contact with id=${contactId} not found`);
       }
   
       res.json(result);
   
    } catch (error) {
       next(error);
    }
   }


export default {
    getAllContacts: ctrlWrapper(getAllContacts),
    getByID: ctrlWrapper(getByID),
    add: ctrlWrapper(add),
    updateById: ctrlWrapper(updateById),
    deleteById: ctrlWrapper(deleteById),
    updateStatusContact,
}