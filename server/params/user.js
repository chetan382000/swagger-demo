const Joi = require('joi');

const userParams = {
    createUser: {
        body: Joi.object({
            fName: Joi.string().required(),
            lName: Joi.string().required(),
            email: Joi.string().required(),
            password: Joi.string().required(),
            userPanCard: Joi.string(),
            userAdharCard:Joi.string(),
        }),
    }
}

module.exports = {
    userParams
}









// const Joi = require("joi");
// const {planDuration} = require("../helpers/enum");

// const gymParams = {
//   // POST gym/createplan
//   createPlan: {
//     body: Joi.object({
//       planName: Joi.string().required(),
//       duration: Joi.string().valid(...Object.values(planDuration)).required(),
//       fees: Joi.string().required(),
//       gymId: Joi.string().hex().required(),
//     }),
//   },