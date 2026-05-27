import { response, type Request } from "express";
import { pool } from "../../db";
import type { TTokenUser } from "../auth/auth.interface";
import type { TIssueCreate } from "./issue.interface";

// an async funtion to return userId extracted from database once the user provides valid email and had access
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

// an async function to create a new issue into database against a userId
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

// an async function to return all isseus from database
const returnIssuesFromDB = async (payload: TTokenUser) => {
  const { email } = payload;

  // return of userEmail in object from database
  const result = await pool.query(
    `
    SELECT email from users where email=$1
    `,
    [email],
  );

  // extraction of userEmail form returned object
  const userEmail = result.rows[0].email;

  // return error of email does not exist in database
  if (!userEmail) return null;

  const resultObj = await pool.query(`
    select * from issues
    `);

  const issuePromises = resultObj.rows.map(async (i) => {
    const {
      id,
      title,
      description,
      type,
      status,
      reported_id,
      created_at,
      updated_at,
    } = i;

    const reporterObj = await pool.query(
      `
        select id, name, role from users where id=$1
        `,
      [reported_id],
    );

    const reporter = reporterObj.rows[0];

    const issue = {
      id,
      title,
      description,
      type,
      status,
      reporter,
      created_at,
      updated_at,
    };

    return issue;
  });

  const unSortedResult = await Promise.all(issuePromises);

  const allIssuesFromDB = unSortedResult;
  return allIssuesFromDB;
};

export const issuesService = {
  createIssueInDB,
  returnUserFromDB,
  returnIssuesFromDB,
};
