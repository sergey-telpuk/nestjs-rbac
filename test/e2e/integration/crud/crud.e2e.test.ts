/* tslint:disable */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { RBAC } from '../../../fixtures/storage';
import { RBAcModule } from '../../../../src';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesController, CompaniesService, Company } from './company';

describe('RBAC Guard', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture = await Test.createTestingModule(
			{
				imports: [
					TypeOrmModule.forRoot({
						type: 'sqlite',
						database: __dirname + '/database.sqlite',
						synchronize: true,
						logging: false,
						entities: [Company],
					}),
					TypeOrmModule.forFeature([Company]),
					RBAcModule.forRoot(RBAC),
				],
				providers: [CompaniesService],
				exports: [CompaniesService],
				controllers: [CompaniesController],
			},
		).compile();

		app = moduleFixture.createNestApplication();

		await app.init();
	});

	describe('CRUD', () => {
		it('Should return 201',
			async () => {
				return request(app.getHttpServer())
					.post('/companies')
					.set('Role', 'user')
					.send({ name: 'some test company' })
					.expect(201);
			});

		it('Should return array of companies',
			async () => {
				return request(app.getHttpServer())
					.get('/companies')
					.set('Role', 'user')
					.send()
					.expect(200).then(response => {
						expect(Array.isArray(response.body)).toBe(true);
					});
			});

		it('Should return 403',
			async () => {
				return request(app.getHttpServer())
					.post('/companies')
					.set('Role', 'userRoot')
					.send({ name: 'some test company' })
					.expect(403);
			});
	});

	afterAll(async () => {
		await app.close();
	});
});
