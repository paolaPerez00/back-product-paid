import { IsEmail, IsInt, IsNotEmpty, IsPositive, IsString, IsIn, Matches } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'Teléfono inválido' })
  phone: string;

  @IsIn(['CC', 'CE', 'NIT', 'PASSPORT'])
  docType: 'CC' | 'CE' | 'NIT' | 'PASSPORT';

  @IsString()
  @IsNotEmpty()
  docNumber: string;

  // --- Entrega ---
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;
}
