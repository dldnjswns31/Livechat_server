import { createToken } from "./../utils/authorizeUtils";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import UserModel from "../models/users";
import { loginValidator, signupValidator } from "./../utils/validator";

export const signin = async (req: Request, res: Response) => {
  req.body;
  const { email, password } = req.body;
  const { isValid, message } = loginValidator({ email, password });

  if (!isValid) {
    return res.status(StatusCodes.BAD_REQUEST).send(message);
  }
  try {
    const dbUser = await UserModel.findOne({ email }).exec();
    if (dbUser) {
      let isPasswordSame = await bcrypt.compare(password, dbUser.password);

      if (isPasswordSame) {
        res.status(StatusCodes.OK).send({
          message: "성공적으로 로그인 했습니다.",
          token: createToken(email),
        });
      } else {
        res.status(StatusCodes.BAD_REQUEST).send("틀린 비밀번호입니다.");
      }
    } else
      res.status(StatusCodes.BAD_REQUEST).send("존재하지 않는 유저입니다.");
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: "server error" });
  }
};

export const signup = async (req: Request, res: Response) => {
  const { email, password, nickname } = req.body;
  const { isValid, message } = signupValidator({ email, nickname, password });
  if (!isValid) {
    return res.status(StatusCodes.BAD_REQUEST).send(message);
  }

  const duplicateEmail = await UserModel.findOne({ email }).exec();
  if (duplicateEmail) {
    return res.status(StatusCodes.CONFLICT).send("이미 존재하는 이메일입니다.");
  }

  const user = new UserModel({ email, password, nickname });

  try {
    await user.save();
    res.status(StatusCodes.OK).send("회원가입 완료됐습니다.");
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: "server error" });
  }
};
