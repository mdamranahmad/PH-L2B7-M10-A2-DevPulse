import { response, type Request } from "express";
import { pool } from "../../db";
import type { TTokenUser } from "../auth/auth.interface";
import type { TIssueCreate, TIssueUpdate } from "./issue.interface";

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

// an asynct function to check existance of user email in database,
const checkUsrInDB = async (payload: TTokenUser) => {
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
};

// an asynct function to build result from issues fetch from database as per desired structure
const buildResult = async (payload: any[]) => {
  const issuePromises = payload.map(async (i) => {
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

  // retrun error if the request fetch no data
  if (!unSortedResult.length) return null;

  return unSortedResult;
};

// an async function to return all isseus from database
const returnIssuesFromDB = async (payload: TTokenUser) => {
  // check existance of user in database
  const fetchUsrInDB = checkUsrInDB(payload);

  // fetch all issues from database
  const resultObj = await pool.query(`
    select * from issues
    `);

  // fetch unsorted issues from database as per desired structure
  const unSortedResult = buildResult(resultObj.rows);

  const allIssuesFromDB = unSortedResult;
  return allIssuesFromDB;
};

// an async function to return individual isseu from database
const returnIssueFromDB = async (payload: TTokenUser, id: string) => {
  // check existance of user in database
  const fetchUsrInDB = checkUsrInDB(payload);

  // fetch all issues from database
  const resultObj = await pool.query(
    `
    select * from issues where id=$1
    `,
    [id],
  );

  // fetch unsorted issues from database as per desired structure
  const result = buildResult(resultObj.rows);

  const indIssueFromDB = result;
  return indIssueFromDB;
};

// an async function to update a specific issue in database
const maintainerUpdateIssueInDB = async (
  payloadIssue: TIssueUpdate,
  id: string,
  payloadUser: TTokenUser,
) => {
  // check existance of user in database
  const fetchUsrInDB = checkUsrInDB(payloadUser);

  // destructuring requested fields to update
  const { title, description, type, status } = payloadIssue;

  // update datababse as per requested fields
  const result = await pool.query(
    `
    update issues
    set
    title=coalesce($1, title),
    description=coalesce($2, description),
    type=coalesce($3, type),
    status=coalesce($4, status),
    updated_at=now()
    where id=$5
    returning *
    `,
    [title, description, type, status, id],
  );

  const updatedIssue = result.rows[0];

  // return updated issue
  return updatedIssue;
};

// an async function to update a specific issue in database for it's owner
const contributorUpdateIssueInDB = async (
  payloadIssue: TIssueUpdate,
  id: string,
  payloadUser: TTokenUser,
) => {
  // check existance of user in database
  const fetchUsrInDB = checkUsrInDB(payloadUser);

  // destructuring requested fields to update
  const { title, description, type } = payloadIssue;

  // update datababse as per requested fields
  const result = await pool.query(
    `
    update issues
    set
    title=coalesce($1, title),
    description=coalesce($2, description),
    type=coalesce($3, type),
    updated_at=now()
    where id=$4
    returning *
    `,
    [title, description, type, id],
  );

  const updatedIssue = result.rows[0];

  // return updated issue
  return updatedIssue;
};

// an async function to delete a specific issue in database
const deleteIssueFromDB = async (id: string, payload: TTokenUser) => {
  // check existance of user in database
  const fetchUsrInDB = checkUsrInDB(payload);

  // update datababse as per requested fields
  const result = await pool.query(
    `
    delete from issues where id=$1 returning *  
    `,
    [id],
  );

  const deletedIssue = result.rows[0];
  return deletedIssue;
};

export const issuesService = {
  createIssueInDB,
  returnUserFromDB,
  returnIssuesFromDB,
  returnIssueFromDB,
  maintainerUpdateIssueInDB,
  contributorUpdateIssueInDB,
  deleteIssueFromDB,
};
