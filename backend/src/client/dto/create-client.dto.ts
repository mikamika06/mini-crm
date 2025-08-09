import { IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  company?: string;
}
