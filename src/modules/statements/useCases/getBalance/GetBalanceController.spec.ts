import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create Get Balance Controller", ()=>{
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

  it("should be able to create get user's balance", async ()=>{
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "test"
    });

    const {token} = responseToken.body;

   await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 100,
      description: "deposit",
    })
    .set({
      Authorization: `Bearer token`,
    });

    await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 90,
      description: "withdraw",
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    const response = await request(app).get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.body).toHaveProperty("balance");

  });

  it("should be not able to get a list of user's balance not registered", async ()=>{

    const response = await request(app).get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer token`,
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");

  });
});
