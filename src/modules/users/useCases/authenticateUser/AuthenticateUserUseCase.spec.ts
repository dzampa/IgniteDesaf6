import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUserRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUserCase: CreateUserUseCase;

describe("Authenticate User",()=>{
    beforeEach(()=>{
      inMemoryUserRepository = new InMemoryUsersRepository();
      authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUserRepository);
      createUserUserCase = new CreateUserUseCase(inMemoryUserRepository);
    });
    it("should be able to authenticate an user", async () =>{
      const user: ICreateUserDTO = {
        email: "test@test.com",
        name: "test",
        password: "1324",
      }
      await createUserUserCase.execute(user);
      const result = await authenticateUserUseCase.execute({
        email: user.email,
        password: user.password,
      });
      expect(result).toHaveProperty("token");
    });

    it("should be not be able to authenticate an non existent user", () => {
      expect(async () =>{
        await authenticateUserUseCase.execute({
          email: "false@test.com",
          password: "1234",
        });
      }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });

    it("should be not be able to authenticate an invalid password", () => {
      expect(async () =>{
        const user: ICreateUserDTO = {
          email: "test@test.com",
          name: "test",
          password: "1324",
        }
        await createUserUserCase.execute(user);
        await authenticateUserUseCase.execute({
          email: user.email,
          password: "incorrect",
        });
      }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });
})
