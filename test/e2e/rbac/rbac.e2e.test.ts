import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { RbacTestController } from './contollers/rbac.test.controller';
import { RBAcModule } from '../../../src/rbac.module';
import { RBAC } from '../../fixtures/storage';

describe('RBAC Guard', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule(
            {
                imports: [
                    RBAcModule.forRoot(RBAC),
                ],
                controllers: [
                    RbacTestController,
                ],
            },
        ).compile();

        app = moduleFixture.createNestApplication();

        await app.init();
    });

    it('Should return 200 because admin has `permission1`', async () => {
        return request(app.getHttpServer())
            .get('/admin-permission1')
            .set('Role', 'admin')
            .send()
            .expect(200);
    });

    it('Should return 200 because admin has `permission1` and `permission2`', async () => {
        return request(app.getHttpServer())
            .get('/admin-permission1-and-permission2')
            .set('Role', 'admin')
            .send()
            .expect(200);
    });

    it('Should return 403 because admin  doesnt have `permission4`', async () => {
        return request(app.getHttpServer())
            .get('/admin-permission4')
            .set('Role', 'admin')
            .send()
            .expect(403);
    });

    it('Should return 200, `request filter` checks on contenting `test` inside Header[test-header]',
     async () => {
        return request(app.getHttpServer())
            .get('/admin-request-filter')
            .set('Role', 'admin')
            .set('test-header', 'test')
            .send()
            .expect(200);
    });

    afterAll(async () => {
        await app.close();
    });
});
