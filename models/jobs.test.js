"use strict";

const db = require("../db");
const Job = require("./job");
const { BadRequestError, NotFoundError } = require("../expressError");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

// Integrate common setup and teardown operations
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
  test("works", async function () {
    let job = await Job.create({
      title: "Software Engineer",
      salary: 100000,
      equity: "0.1",
      company_handle: "c1",
    });
    expect(job).toEqual({
      id: expect.any(Number),
      title: "Software Engineer",
      salary: 100000,
      equity: "0.1",
      companyHandle: "c1",
    });
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create({
        title: "Software Engineer",
        salary: 100000,
        equity: "0.1",
        company_handle: "c1",
      });
      await Job.create({
        title: "Software Engineer",
        salary: 100000,
        equity: "0.1",
        company_handle: "c1",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("findAll", function () {
  test("works", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Data Scientist",
        salary: 120000,
        equity: "0.2",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "Product Manager",
        salary: 90000,
        equity: "0.05",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "Software Engineer",
        salary: 100000,
        equity: "0.1",
        companyHandle: "c1",
      },
    ]);
  });
});

describe("findFiltered", function () {
  test("works: partial filters", async function () {
    let jobs = await Job.findFiltered({ title: "Engineer" });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Software Engineer",
        salary: 100000,
        equity: "0.1",
        companyHandle: "c1",
      },
    ]);
  });

  test("fails: minSalary > maxSalary", async function () {
    try {
      await Job.findFiltered({ minSalary: 150000, maxSalary: 100000 });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
      title: "Software Engineer",
      salary: 100000,
      equity: "0.1",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("update", function () {
  test("works", async function () {
    let job = await Job.update(1, { title: "Updated" });
    expect(job).toEqual({
      id: 1,
      title: "Updated",
      salary: 100000,
      equity: "0.1",
      companyHandle: "c1",
    });
  });

  test("works: null fields", async function () {
    let job = await Job.update(1, { title: "Updated", salary: null });
    expect(job).toEqual({
      id: 1,
      title: "Updated",
      salary: null,
      equity: "0.1",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, { title: "test" });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query("SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
