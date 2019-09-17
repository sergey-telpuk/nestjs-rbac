import { INestApplication } from '@nestjs/common';
import { RBAcModule } from '../../../src/rbac.module';
import { RbacService } from '../../../src/services/rbac.service';
import { Test } from '@nestjs/testing';
import { RBAC } from '../../fixtures/storage';
import { RbacCache } from '../../../src/cache/rbac.cache';
import { ICacheRBAC } from '../../../src/interfaces/cache.rbac.interface';


describe('Rbac Cache', () => {
  let app: INestApplication;
  let rbacService: RbacService;
  let cache: ICacheRBAC;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule(
      {
        imports: [
          RBAcModule.useCache(RbacCache, {KEY: 'RBAC'}).forRoot(RBAC),
        ],
        controllers: [],
      },
    ).compile();

    app = moduleFixture.createNestApplication();
    rbacService = moduleFixture.get(RbacService);
    cache = moduleFixture.get('ICacheRBAC');

    await app.init();
  });

  describe('Cache service', () => {
    it('Should set and get.',
      async () => {
        cache.set({cache: 'cache'});
        expect(cache.get()).toEqual({cache: 'cache'});
      });
  });


  afterAll(async () => {
    await app.close();
  });
});
