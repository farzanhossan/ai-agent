import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ENUM_USER_GENDER } from '../../enums';

export class CreateRolesDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 1,
  })
  @IsNotEmpty()
  @IsString()
  readonly role!: any;
}

class AddressDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Line 1',
  })
  @IsOptional()
  @IsString()
  readonly line1?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Line 2',
  })
  @IsOptional()
  @IsString()
  readonly line2?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'City',
  })
  @IsOptional()
  @IsString()
  readonly city?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'State',
  })
  @IsOptional()
  @IsString()
  readonly state?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Zip',
  })
  @IsOptional()
  @IsString()
  readonly zip?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Country',
  })
  @IsOptional()
  @IsString()
  readonly country?: string;
}

class EmergencyContactDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Jon Doe',
  })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '+0000000000000',
  })
  @IsOptional()
  @IsString()
  readonly phoneNumber?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Friend',
  })
  @IsOptional()
  @IsString()
  readonly relationship?: string;
}

class InstituteDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Institute Name',
  })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Degree Name',
  })
  @IsOptional()
  @IsString()
  readonly degree?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Major Name',
  })
  @IsOptional()
  @IsString()
  readonly major?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'From Date',
  })
  @IsOptional()
  @IsString()
  readonly fromDate?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'To Date',
  })
  @IsOptional()
  @IsString()
  readonly toDate?: string;
}

export class CreateUserDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Zahid',
  })
  @IsNotEmpty()
  @IsString()
  readonly firstName!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Hasan',
  })
  @IsNotEmpty()
  @IsString()
  readonly lastName!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Image Url',
  })
  @IsOptional()
  @IsString()
  readonly avatar!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'username/email/phonenumber',
  })
  @IsString()
  @IsOptional()
  readonly identifier!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'test@example.com',
  })
  @IsString()
  @IsOptional()
  @IsEmail()
  readonly email!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '+0000000000000',
  })
  @IsString()
  @IsOptional()
  readonly phoneNumber!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'username',
  })
  @IsString()
  @IsOptional()
  readonly username!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'USER ID, example: TM-1234-U',
  })
  @IsString()
  @IsOptional()
  readonly code!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '123456',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  readonly password!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: Object.values(ENUM_USER_GENDER).join(' / '),
  })
  @IsOptional()
  @IsString()
  readonly gender?: string;

  @ApiProperty({
    type: [CreateRolesDTO],
    required: false,
    example: [
      {
        role: 'uuid 1',
      },
      {
        role: 'uuid 2',
      },
    ],
  })
  @ValidateNested()
  @Type(() => CreateRolesDTO)
  @IsOptional()
  readonly roles!: CreateRolesDTO[];

  @ApiProperty({
    type: [AddressDTO],
    required: false,
  })
  @ValidateNested()
  @Type(() => AddressDTO)
  @IsOptional()
  readonly address!: AddressDTO[];

  @ApiProperty({
    type: [InstituteDTO],
    required: false,
    example: [
      {
        name: 'A College',
        degree: 'Std. 10',
        major: 'Science',
        fromDate: 'ISO Date',
        toDate: 'ISO Date',
      },
    ],
  })
  @ValidateNested()
  @Type(() => InstituteDTO)
  @IsOptional()
  readonly institutes!: InstituteDTO[];

  @ApiProperty({
    type: String,
    required: false,
    example: '2025-02-16',
  })
  @IsOptional()
  @IsString()
  readonly dob?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '2025-02-16',
  })
  @IsOptional()
  @IsString()
  readonly joiningDate?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Nationality',
  })
  @IsOptional()
  @IsString()
  readonly nationality?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'National Identity',
  })
  @IsOptional()
  @IsString()
  readonly nationalIdentity?: string;

  @ApiProperty({
    type: [EmergencyContactDTO],
    required: false,
  })
  @ValidateNested()
  @Type(() => EmergencyContactDTO)
  @IsOptional()
  readonly emergencyContact?: EmergencyContactDTO[];

  @ApiProperty({
    type: Boolean,
    description: 'is information visible to public',
    default: '',
    required: false,
  })
  @IsOptional()
  readonly isVisibleToPublic!: boolean;

  @IsOptional()
  readonly createdBy!: any;
}
