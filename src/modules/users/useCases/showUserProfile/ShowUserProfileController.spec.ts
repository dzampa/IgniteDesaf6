import request from "supertest";
import { Connection} from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("User Profile Controller", () =>{
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

  it("should be able to show a user profile", async ()=> {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "test"
    });

    const {token} = responseToken.body;

    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`,
    })

    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to show an non exist user's token", async () =>{

    const response = await request(app).get("/api/v1/profile").set({
      Authorization: "Bearer token",
    })

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

});
