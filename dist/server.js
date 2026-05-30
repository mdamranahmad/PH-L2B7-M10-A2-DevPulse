
    import {createRequire} from 'module';
    const require = createRequire(import.meta.url);
    

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/utilities/sendResponse.ts
var sendResponse = (res, statusCode, payload) => {
  res.status(statusCode).json({
    success: payload.error ? false : true,
    message: payload.message,
    data: payload.error ? void 0 : payload.data,
    stack: payload.stack
  });
};

// src/modules/auth/auth.service.ts
import "pg";
import brcypt from "bcrypt";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import { env } from "process";
dotenv.config();
var config = {
  port: env.PORT,
  database_url: env.CONNECTION_STRING,
  secret_key: env.SECRET,
  refresh_secret_key: env.SECRET_REFRESH,
  node_env: env.NODE_ENV
};

// src/db/index.ts
var pool = new Pool({
  connectionString: config.database_url
});
var initDB = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,

        password_hash TEXT NOT NULL,

        role VARCHAR(20) DEFAULT 'contributor' NOT NULL CONSTRAINT check_user_role CHECK(role IN('contributor', 'maintainer')),

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);
  await pool.query(`
        CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT, 

        type VARCHAR(25) NOT NULL CONSTRAINT check_type CHECK(type IN('bug', 'feature_request')),

        status VARCHAR(20) DEFAULT 'open' NOT NULL CONSTRAINT check_status CHECK(status in ('open', 'in_progress', 'resolved')),

        reported_id INT REFERENCES users(id) ON DELETE CASCADE,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        

        )
        `);
  console.log("Database Connected Successfully.");
};

// src/modules/auth/auth.service.ts
var signUpUser = async (payload) => {
  const { name, email, password, role = "contributor" } = payload;
  const hash_password = await brcypt.hash(password, 10);
  const user = await pool.query(
    `
        INSERT INTO users(name, email, password_hash, role)
        VALUES($1, $2, $3, $4)
        RETURNING *
        `,
    [name, email, hash_password, role]
  );
  const { password_hash, ...returnUser } = user.rows[0];
  return returnUser;
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  const res = await pool.query(
    `
    SELECT * FROM users WHERE email = $1
    `,
    [email]
  );
  if (!res.rows.length) return null;
  const isValidUser = await brcypt.compare(password, res.rows[0].password_hash);
  const { password_hash, ...user } = res.rows[0];
  return isValidUser ? user : null;
};
var authServices = {
  signUpUser,
  loginUser
};

// src/utilities/token.ts
import jwt from "jsonwebtoken";
var tokenGeneration = (payload) => {
  const accessToken = jwt.sign(payload, config.secret_key, {
    expiresIn: "1d"
  });
  const refershToken = jwt.sign(payload, config.refresh_secret_key, {
    expiresIn: "10d"
  });
  return { accessToken, refershToken };
};
var tokenDecode = (payload) => {
  const decode = jwt.verify(payload, config.secret_key);
  return decode;
};

// src/modules/auth/auth.controller.ts
var authSignup = async (req, res) => {
  const user = await authServices.signUpUser(req.body);
  sendResponse(res, 200, {
    message: `Registration successfull for ${user.name}.`,
    data: user
  });
};
var authLogin = async (req, res) => {
  const user = await authServices.loginUser(req.body);
  if (!user) {
    sendResponse(res, 401, {
      message: "Invalid Credentials",
      error: true
    });
    return;
  }
  const { accessToken, refershToken } = tokenGeneration(user);
  res.cookie("accessToken", accessToken, {
    sameSite: "lax",
    httpOnly: true,
    secure: false
  });
  const sendUser = { token: accessToken, user };
  sendResponse(res, 200, {
    message: "Login Successful",
    data: sendUser
  });
};
var authController = {
  authSignup,
  authLogin
};

// src/modules/auth/auth.route.ts
var router = Router();
router.get("/", (req, res) => {
  sendResponse(res, 200, {
    message: "authorized page to test the link",
    data: null
  });
});
router.post("/signup", authController.authSignup);
router.post("/login", authController.authLogin);
var authRouter = router;

// src/utilities/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  sendResponse(res, 500, {
    message: "Something Went Wrong!",
    error: err.message,
    stack: config.node_env === "development" ? err.stack : void 0
  });
};

// src/modules/issues/issues.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issues.service.ts
import "express";
var returnUserFromDB = async (payload) => {
  const { email, role } = payload;
  const result = await pool.query(
    `
    SELECT id FROM users WHERE email=$1 AND role=$2
    `,
    [email, role]
  );
  const userId = result.rows[0];
  return userId.id;
};
var createIssueInDB = async (payload, userId) => {
  const { title, description, type, status } = payload;
  const result = await pool.query(
    `
    INSERT INTO issues(title, description, type, status, reported_id)
    VALUES($1, $2, $3, COALESCE($4, 'open'), $5)
    RETURNING *
    `,
    [title, description, type, status, userId]
  );
  const issue = result.rows[0];
  return issue;
};
var checkUsrInDB = async (payload) => {
  const { email } = payload;
  const result = await pool.query(
    `
    SELECT email from users where email=$1
    `,
    [email]
  );
  const userEmail = result.rows[0].email;
  if (!userEmail) return null;
};
var buildResult = async (payload) => {
  const issuePromises = payload.map(async (i) => {
    const {
      id,
      title,
      description,
      type,
      status,
      reported_id,
      created_at,
      updated_at
    } = i;
    const reporterObj = await pool.query(
      `
        select id, name, role from users where id=$1
        `,
      [reported_id]
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
      updated_at
    };
    return issue;
  });
  const unSortedResult = await Promise.all(issuePromises);
  if (!unSortedResult.length) return null;
  return unSortedResult;
};
var returnIssuesFromDB = async (payload) => {
  const fetchUsrInDB = checkUsrInDB(payload);
  const resultObj = await pool.query(`
    select * from issues
    `);
  const unSortedResult = buildResult(resultObj.rows);
  const allIssuesFromDB = unSortedResult;
  return allIssuesFromDB;
};
var returnIssueFromDB = async (payload, id) => {
  const fetchUsrInDB = checkUsrInDB(payload);
  const resultObj = await pool.query(
    `
    select * from issues where id=$1
    `,
    [id]
  );
  const result = buildResult(resultObj.rows);
  const indIssueFromDB = result;
  return indIssueFromDB;
};
var maintainerUpdateIssueInDB = async (payloadIssue, id, payloadUser) => {
  const fetchUsrInDB = checkUsrInDB(payloadUser);
  const { title, description, type, status } = payloadIssue;
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
    [title, description, type, status, id]
  );
  const updatedIssue = result.rows[0];
  return updatedIssue;
};
var contributorUpdateIssueInDB = async (payloadIssue, id, payloadUser) => {
  const fetchUsrInDB = checkUsrInDB(payloadUser);
  const { title, description, type } = payloadIssue;
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
    [title, description, type, id]
  );
  const updatedIssue = result.rows[0];
  return updatedIssue;
};
var deleteIssueFromDB = async (id, payload) => {
  const fetchUsrInDB = checkUsrInDB(payload);
  const result = await pool.query(
    `
    delete from issues where id=$1 returning *  
    `,
    [id]
  );
  const deletedIssue = result.rows[0];
  return deletedIssue;
};
var issuesService = {
  createIssueInDB,
  returnUserFromDB,
  returnIssuesFromDB,
  returnIssueFromDB,
  maintainerUpdateIssueInDB,
  contributorUpdateIssueInDB,
  deleteIssueFromDB
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  if (!req.headers.authorization) {
    sendResponse(res, 401, {
      message: "Missing Token!",
      error: true
    });
  }
  const decodedToken = tokenDecode(req.headers.authorization);
  const userId = await issuesService.returnUserFromDB(
    decodedToken
  );
  const issue = await issuesService.createIssueInDB(req.body, userId);
  sendResponse(res, 201, {
    message: "Issue Created Successfully.",
    data: issue
  });
};
var getIssues = async (req, res) => {
  if (!req.headers.authorization) {
    sendResponse(res, 401, {
      message: "Missing Token!",
      error: true
    });
  }
  const decodedToken = tokenDecode(req.headers.authorization);
  const allIssuesFromDB = await issuesService.returnIssuesFromDB(
    decodedToken
  );
  const sortIssues = () => {
    if (req.url === "/" || req.url === "/?sort=newest") {
      const sortByTime = [...allIssuesFromDB ?? []].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      return sortByTime;
    }
    if (req.url === "/?sort=type") {
      const sortByType = [...allIssuesFromDB ?? []].sort((a, b) => {
        return a.type.localeCompare(b.type);
      });
      return sortByType;
    }
    if (req.url === "/?sort=status") {
      const statusPriority = {
        open: 1,
        in_progress: 2,
        resolved: 3
      };
      const sortByStatus = [...allIssuesFromDB ?? []].sort((a, b) => {
        return (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99);
      });
      return sortByStatus;
    }
    return null;
  };
  const sortedIssues = sortIssues();
  if (sortedIssues !== null) {
    sendResponse(res, 200, {
      message: "Issues retrived successfully",
      data: sortedIssues
    });
  } else {
    sendResponse(res, 404, {
      message: "Invalid request",
      error: true
    });
  }
};
var getIssuebyId = async (req, res) => {
  const reqId = req.params.id;
  if (!req.headers.authorization) {
    sendResponse(res, 401, {
      message: "Missing Token!",
      error: true
    });
  }
  const decodedToken = tokenDecode(req.headers.authorization);
  const indIssueFromDB = await issuesService.returnIssueFromDB(
    decodedToken,
    reqId
  );
  if (indIssueFromDB !== null) {
    sendResponse(res, 200, {
      message: "Issues retrived successfully",
      data: indIssueFromDB
    });
  } else {
    sendResponse(res, 404, {
      message: "Invalid request",
      error: true
    });
  }
};
var updateIssue = async (req, res) => {
  const reqId = req.params.id;
  if (!req.headers.authorization) {
    sendResponse(res, 401, {
      message: "Missing Token!",
      error: true
    });
  }
  const decodedToken = tokenDecode(req.headers.authorization);
  const { id, role } = decodedToken;
  const indIssueFromDB = await issuesService.returnIssueFromDB(
    decodedToken,
    reqId
  );
  if (!indIssueFromDB || indIssueFromDB.length === 0) {
    return sendResponse(res, 404, {
      message: "Invalid request",
      error: true
    });
  }
  const { reporter } = indIssueFromDB[0];
  let updatedIssue;
  if (role === "maintainer") {
    updatedIssue = await issuesService.maintainerUpdateIssueInDB(
      req.body,
      reqId,
      decodedToken
    );
  }
  if (role === "contributor" && id === reporter.id) {
    if (req.body.status) {
      return sendResponse(res, 403, {
        message: "Forbidden",
        error: true
      });
    }
    updatedIssue = await issuesService.contributorUpdateIssueInDB(
      req.body,
      reqId,
      decodedToken
    );
  }
  if (role === "contributor" && id !== reporter.id) {
    return sendResponse(res, 403, {
      message: "Forbidden",
      error: true
    });
  }
  sendResponse(res, 200, {
    message: "Issue updated successfully.",
    data: updatedIssue
  });
};
var deleteIssue = async (req, res) => {
  const reqId = req.params.id;
  if (!req.headers.authorization) {
    sendResponse(res, 401, {
      message: "Missing Token!",
      error: true
    });
  }
  const decodedToken = tokenDecode(req.headers.authorization);
  const { id, role } = decodedToken;
  const indIssueFromDB = await issuesService.returnIssueFromDB(
    decodedToken,
    reqId
  );
  if (!indIssueFromDB || indIssueFromDB.length === 0) {
    return sendResponse(res, 404, {
      message: "Invalid request",
      error: true
    });
  }
  const { reporter } = indIssueFromDB[0];
  if (role === "maintainer") {
    const deletedIssue = await issuesService.deleteIssueFromDB(
      reqId,
      decodedToken
    );
    return sendResponse(res, 200, {
      message: "Issue deleted successfully.",
      data: deletedIssue
    });
  } else {
    return sendResponse(res, 403, {
      message: "Forbidden",
      error: true
    });
  }
};
var issuesController = {
  createIssue,
  getIssues,
  getIssuebyId,
  updateIssue,
  deleteIssue
};

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.post("/", issuesController.createIssue);
router2.get("/", issuesController.getIssues);
router2.get("/:id", issuesController.getIssuebyId);
router2.patch("/:id", issuesController.updateIssue);
router2.delete("/:id", issuesController.deleteIssue);
var issuesRouter = router2;

// src/app.ts
var app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to DevPulse"
  });
});
app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config.port, () => {
    console.log(`Server is listening on port ${config.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map