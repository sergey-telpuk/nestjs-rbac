/* tslint:disable */
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { RBAcGuard, RBAcPermissions } from '../../../../src';
import { AuthGuard } from '../../rbac/guards/auth.guard';

@Entity()
export class Company {
	@PrimaryGeneratedColumn() id: number;

	@Column() name: string;
}


@Injectable()
export class CompaniesService extends TypeOrmCrudService<Company> {
	constructor(@InjectRepository(Company) repo) {
		super(repo);
	}
}

@Crud({
	model: {
		type: Company,
	},
})
@RBAcPermissions('permission2')
@UseGuards(
	AuthGuard,
	RBAcGuard,
)
@Controller('companies')
export class CompaniesController implements CrudController<Company> {
	constructor(public service: CompaniesService) {}
}
