"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError, ForbiddenError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureIsAdminOrOwner,
} = require("./auth");
const { SECRET_KEY } = require("../config");

const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const adminJwt = jwt.sign({ username: "admin", isAdmin: true }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

// Tests for authenticateJWT middleware
describe("authenticateJWT", function () {
  test("works: via header", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals.user).toBeNull();
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});

// Tests for ensureLoggedIn middleware
describe("ensureLoggedIn", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

// Tests for ensureAdmin middleware
describe("ensureAdmin", function () {
  test("works for admin", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "admin", isAdmin: true } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureAdmin(req, res, next);
  });

  test("forbidden if not admin", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    const next = function (err) {
      expect(err instanceof ForbiddenError).toBeTruthy();
    };
    ensureAdmin(req, res, next);
  });

  test("forbidden if not logged in", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof ForbiddenError).toBeTruthy();
    };
    ensureAdmin(req, res, next);
  });
});

// Tests for ensureIsAdminOrOwner middleware
describe("ensureIsAdminOrOwner", function () {
  test("works for admin", function () {
    expect.assertions(1);
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "admin", isAdmin: true } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureIsAdminOrOwner(req, res, next);
  });

  test("works for owner", function () {
    expect.assertions(1);
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureIsAdminOrOwner(req, res, next);
  });

  test("forbidden if not admin or owner", function () {
    expect.assertions(1);
    const req = { params: { username: "other" } };
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    const next = function (err) {
      expect(err instanceof ForbiddenError).toBeTruthy();
    };
    ensureIsAdminOrOwner(req, res, next);
  });

  test("forbidden if not logged in", function () {
    expect.assertions(1);
    const req = { params: { username: "test" } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof ForbiddenError).toBeTruthy();
    };
    ensureIsAdminOrOwner(req, res, next);
  });
});
