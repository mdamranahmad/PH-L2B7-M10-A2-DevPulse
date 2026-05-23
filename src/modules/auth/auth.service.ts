import { Pool } from "pg";
import brcypt from "bcrypt";
import type { TSignUpUser } from "./auth.interface";
import { pool } from "../../db";

// an async function to insert newly created user data into database
const signUpUser = async (payload: TSignUpUser) => {
  // if payload does not contain a value for role, it will get a default value
  const { name, email, password, role = "contributor" } = payload;
  console.log({ password });

  const hash_password = await brcypt.hash(password, 10);
  console.log({ hash_password });

  const user = await pool.query(
    `
        INSERT INTO users(name, email, password_hash, role)
        VALUES($1, $2, $3, $4)
        RETURNING *
        `,
    [name, email, hash_password, role],
  );
  console.log(user.rows[0]);
};

export const authServices = {
  signUpUser,
};
