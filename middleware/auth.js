"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError, ForbiddenError } = require("../expressError");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    } else {
      res.locals.user = null; //No token provided, set res.locals to an empty object
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

// Middleware to check if the user is admin.
// If not raises Forbidden.

function ensureAdmin(req, res, next) {
  try {
    // Check if user is authenticated
    if (!res.locals.user) {
      throw new ForbiddenError("You must be logged in to perform this action.");
    }

    // Check if user is an admin
    if (res.locals.user.isAdmin) {
      return next();
    } else {
      throw new ForbiddenError(
        "You do not have permission to perform this action."
      );
    }
  } catch (error) {
    return next(error);
  }
}

// Middleware to check if the user is the owner of the resource or an admin
// Checks if the user ID from the token matches the resource ID or of the user is admin

function ensureIsAdminOrOwner(req, res, next) {
  try {
    // Check if user is authenticated
    if (!res.locals.user) {
      throw new ForbiddenError("You must be logged in to perform this action.");
    }

    const userIdFromToken = res.locals.user.username;
    const resourceId = req.params.username || req.query.username;

    if (res.locals.user.isAdmin || userIdFromToken === resourceId) {
      return next();
    } else {
      throw new ForbiddenError(
        "You do not have permission to perform this action."
      );
    }
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureIsAdminOrOwner,
};
