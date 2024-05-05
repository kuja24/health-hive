import jwt from "jsonwebtoken";
import { createError } from "../error.js";

//we need to vlidate the access token passed in req is valid or not
export const verifyToken = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return next(createError(401, "You are not authorized! Please pass the access token"));
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) return next(createError(401, "You are not authorized! Pass the correct token"));

    const decode = jwt.verify(token, process.env.SECRET);
    req.user = decode;
    return next();
  } catch (err) {
    next(err);
  }
};
