import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile",()=>{
    beforeEach(()=>{
      inMemoryUserRepository = new InMemoryUsersRepository();
      showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUserRepository)
      createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
    });

    it("should be able to show a user profile", async () =>{
      const user: ICreateUserDTO = {
        email: "test@test.com",
        name: "test",
        password: "1324",
      }

      const userCreated = await createUserUseCase.execute(user);

      const result = await showUserProfileUseCase.execute(userCreated.id);

      expect(result).toHaveProperty("id");
    });

    it("should not be able to show an non exist user ", () =>{
      expect(async () => {
        await showUserProfileUseCase.execute("error");
      }).rejects.toBeInstanceOf(ShowUserProfileError);
    });
})
