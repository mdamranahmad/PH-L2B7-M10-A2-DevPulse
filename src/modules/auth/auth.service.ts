import { Pool } from "pg";
import brcypt from "bcrypt";
import type { TLoginUser, TSignUpUser } from "./auth.interface";
import { pool } from "../../db";
import { sendResponse } from "../../utilities/sendResponse";

// an async function to insert newly created user data into database
const signUpUser = async (payload: TSignUpUser) => {
  // if payload does not contain a value for role, it will get a default value
  const { name, email, password, role = "contributor" } = payload;

  // before sending password into database, the given password is encrypted for security
  const hash_password = await brcypt.hash(password, 10);

  // insertion of user info into database, for successful entry, name, email and role will be returned. password will not be returned
  const user = await pool.query(
    `
        INSERT INTO users(name, email, password_hash, role)
        VALUES($1, $2, $3, $4)
        RETURNING *
        `,
    [name, email, hash_password, role],
  );

  // return password from return data
  const { password_hash, ...returnUser } = user.rows[0];
  // returns the successful entry from database
  return returnUser;
};

// an async function to login user into data base after validation
const loginUser = async (payload: TLoginUser) => {
  const { email, password } = payload;

  // fetch user from database as given email
  const res = await pool.query(
    `
    SELECT * FROM users WHERE email = $1
    `,
    [email],
  );

  // if user does not exists in database, return null
  if (!res.rows.length) return null;

  // vaidation of user via password_hash decryption and comparison
  const isValidUser = await brcypt.compare(password, res.rows[0].password_hash);

  // removal of password from data returned from database
  const { password_hash, ...user } = res.rows[0];

  // if given passord does not match, return null, otherwise return user
  return isValidUser ? user : null;
};

export const authServices = {
  signUpUser,
  loginUser,
};
