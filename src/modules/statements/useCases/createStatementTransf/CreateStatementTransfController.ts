import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateStatementTransfUseCase } from "./CreateStatementTransfUseCase";

export class CreateStatementTransfController{
  async execute(request: Request, response: Response){
    const { id } = request.user;
    const { user_id } = request.params;
    const { amount, description } = request.body;

    const createStatementTransf = container.resolve(CreateStatementTransfUseCase);

    const transfer = await createStatementTransf.execute({
      id,
      sender_id: user_id,
      amount,
      description
    })

    return response.status(201).json(transfer);

  }

}
