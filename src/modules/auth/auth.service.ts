import { Pool } from "pg";
import brcypt from "bcrypt";
import type { TSignUpUser } from "./auth.interface";
import { pool } from "../../db";

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
  const {password_hash, ... returnUser} =user.rows[0];
  // returns the successful entry from database
  return returnUser;
};

export const authServices = {
  signUpUser,
};
