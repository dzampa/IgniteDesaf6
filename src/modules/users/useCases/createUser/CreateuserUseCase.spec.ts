import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { CreateUserError } from "./CreateUserError";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUserCase: CreateUserUseCase;

describe("Create User",()=>{
    beforeEach(()=>{
      inMemoryUserRepository = new InMemoryUsersRepository();
      createUserUserCase = new CreateUserUseCase(inMemoryUserRepository);
    });

    it("should be able to create an user", async () =>{
      const user: ICreateUserDTO = {
        email: "test@test.com",
        name: "test",
        password: "1324",
      }

      const userCreated = await createUserUserCase.execute(user);

      expect(userCreated).toHaveProperty("id");
    });

    it("should be able to create an existent user", () =>{
      expect(async()=>{

        await createUserUserCase.execute({
          email: "test@test.com",
          name: "test",
          password: "1234",
        });
        await createUserUserCase.execute({
          email: "test@test.com",
          name: "testa",
          password: "12341",
        });
      }).rejects.toBeInstanceOf(CreateUserError);
    });
})
