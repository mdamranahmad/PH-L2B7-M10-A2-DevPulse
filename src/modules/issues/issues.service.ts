import { pool } from "../../db";
import type { TTokenUser } from "../auth/auth.interface";
import type { TIssueCreate } from "./issue.interface";

const returnUserFromDB = async (payload: TTokenUser) => {
  const { email, role } = payload;

  const result = await pool.query(
    `
    SELECT id FROM users WHERE email=$1 AND role=$2
    `,
    [email, role],
  );

  const userId = result.rows[0];

  return userId.id;
};

const createIssueInDB = async (payload: TIssueCreate, userId: number) => {
  const { title, description, type, status } = payload;

  const result = await pool.query(
    `
    INSERT INTO issues(title, description, type, status, reported_id)
    VALUES($1, $2, $3, COALESCE($4, 'open'), $5)
    RETURNING *
    `,
    [title, description, type, status, userId],
  );

  const issue = result.rows[0];
  return issue;
};

export const issuesService = {
  createIssueInDB,
  returnUserFromDB,
};
