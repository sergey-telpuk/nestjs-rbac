import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { RbacTestController } from './contollers/rbac.test.controller';
import { RBAcModule } from '../../../src';
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

  describe('Extends', () => {

    it('Should return 200 because user extends userRoot',
      async () => {
        return request(app.getHttpServer())
          .get('/user-extends-userRoot')
          .set('Role', 'user')
          .set('test-header', 'test')
          .send()
          .expect(200);
      });

    it('Should return 403 because admin dont extends userRoot, deep extends doesnt work',
      async () => {
        return request(app.getHttpServer())
          .get('/user-extends-userRoot')
          .set('Role', 'admin')
          .set('test-header', 'test')
          .send()
          .expect(403);
      });

  });

  describe('Filters', () => {

    it('Should return 200, `request filter` checks on contenting `test` inside Header[test-header]',
      async () => {
        return request(app.getHttpServer())
          .get('/admin-request-filter')
          .set('Role', 'admin')
          .set('test-header', 'test')
          .send()
          .expect(200);
      });

    it('Should return 403, `request filter` checks on contenting `test` inside Header[test-header]',
      async () => {
        return request(app.getHttpServer())
          .get('/admin-request-filter')
          .set('Role', 'admin')
          .set('test-header', 'test-dosnt-work')
          .send()
          .expect(403);
      });

    it('Should return 403, because user doesnt have permission3',
      async () => {
        return request(app.getHttpServer())
          .get('/admin-request-filter')
          .set('Role', 'user')
          .set('test-header', 'test')
          .send()
          .expect(403);
      });

  });

  describe('Permission', () => {

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

    it('Should return 200 because user has permission1@create', async () => {
      return request(app.getHttpServer())
        .get('/user-permission1@create')
        .set('Role', 'user')
        .send()
        .expect(200);
    });

    it('Should return 200 because admin has permission1@delete', async () => {
      return request(app.getHttpServer())
        .get('/user-permission1@delete')
        .set('Role', 'admin')
        .send()
        .expect(200);
    });

    it('Should return 403 because user doesnt have permission1@delete', async () => {
      return request(app.getHttpServer())
        .get('/user-permission1@delete')
        .set('Role', 'user')
        .send()
        .expect(403);
    });

  });

  afterAll(async () => {
    await app.close();
  });
});
