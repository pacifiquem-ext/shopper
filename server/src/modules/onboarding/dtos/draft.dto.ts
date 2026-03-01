import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmptyObject, IsObject, Max, Min } from 'class-validator';

export class UpdateDraftDto {
    @ApiProperty({
        description: 'Structured JSON data of the current onboarding progress',
        example: {
            step1: { registeredName: 'My Store', industry: 'RETAIL' },
        },
    })
    @IsObject()
    @IsNotEmptyObject()
    draftData: Record<string, any>;

    @ApiProperty({
        description: 'The current step the user is on',
        example: 2,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    currentStep: number;

    @ApiProperty({
        description: 'Completion percentage calculated by the frontend',
        example: 50,
    })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(100)
    completionPercentage: number;
}
