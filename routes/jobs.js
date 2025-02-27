"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login and admin
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET / =>
 *  { jobs: [ { id, title, salary, equity, companyHandle }, ... ] }
 *
 * Can filter on provided search filters:
 * - title
 * - minSalary
 * - hasEquity (true/false)
 *
 * Authorization required: none
 */

router.get("/", async (req, res, next) => {
  try {
    const { title, minSalary, hasEquity, ...rest } = req.query;

    // Ensure no unexpected query parameters are present
    if (Object.keys(rest).length > 0) {
      throw new BadRequestError("Invalid filter query");
    }

    // Ensure minSalary is a number if provided
    if (minSalary && isNaN(parseInt(minSalary))) {
      throw new BadRequestError("Invalid filter query");
    }

    const jobs = await Job.findFiltered({
      title,
      minSalary,
      hasEquity:
        hasEquity === "true" ? true : hasEquity === "false" ? false : undefined,
    });
    return res.json({ jobs });
  } catch (error) {
    return next(error);
  }
});

/** GET /:id  =>  { job }
 *
 *  Job is { id, title, salary, equity, companyHandle }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /:id { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login and admin
 */

router.patch(
  "/:id",
  ensureLoggedIn,
  ensureAdmin,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const job = await Job.update(req.params.id, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /:id  =>  { deleted: id }
 *
 * Authorization: login and admin
 */

router.delete(
  "/:id",
  ensureLoggedIn,
  ensureAdmin,
  async function (req, res, next) {
    try {
      await Job.remove(req.params.id);
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
