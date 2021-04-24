import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create Get Statement Operation Controller", ()=>{
  beforeAll(async () =>{
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@test.com",
      password: "test"
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a user's statement operation", async ()=>{
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "test"
    });

    const {token} = responseToken.body;

    const responseOperation = await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 100,
      description: "deposit",
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    const {id} = responseOperation.body;

    const response = await request(app).get(`/api/v1/statements/${id}`)
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.body).toHaveProperty("id");

  });

  it("should not be able to get a user's statement operation with invalid token", async ()=>{
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "test"
    });

    const {token} = responseToken.body;

    const responseOperation = await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 100,
      description: "deposit",
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    const {id} = responseOperation.body;



    const response = await request(app).get(`/api/v1/statements/${id}`)
    .set({
      Authorization: `Bearer token`,
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");

  });

  it("should not be able to get a user's statement operation with invalid id operation", async ()=>{
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "test"
    });

    const {token} = responseToken.body;

    const id = uuid();

    const response = await request(app).get(`/api/v1/statements/${id}`)
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");

  });
});
