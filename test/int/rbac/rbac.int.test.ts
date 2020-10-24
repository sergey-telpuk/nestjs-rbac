import { INestApplication } from '@nestjs/common';
import { RBAcModule } from '../../../src/rbac.module';
import { RbacService } from '../../../src/services/rbac.service';
import { Test } from '@nestjs/testing';
import { RBAC } from '../../fixtures/storage';
import { ParamsFilter } from '../../../src/params-filter/params.filter';


describe('RBAC service', () => {
  let app: INestApplication;
  let rbacService: RbacService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule(
      {
        imports: [
          RBAcModule.forRoot(RBAC),
        ],
        controllers: [],
      },
    ).compile();

    app = moduleFixture.createNestApplication();
    rbacService = moduleFixture.get(RbacService);

    await app.init();
  });

  describe('Permission', () => {

    it('Should return true because admin has permissions for permission1@create',
      async () => {
        const res = (await rbacService.getRole('admin')).can('permission1@create');
        expect(res).toBe(true);
      });

    it('Should return false because user hasn\'t permissions for permission1@update',
      async () => {
        const res = (await rbacService.getRole('user')).can('permission1@update');
        expect(res).toBe(false);
      });

    it('Should return true because user has permissions for permission1@create',
      async () => {
        const res = (await rbacService.getRole('user')).can('permission1@create');
        expect(res).toBe(true);
      });

  });

  describe('Extends', () => {

    it('Should return true because admin extends user',
      async () => {
        const res = (await rbacService.getRole('admin')).can('permission2@update');
        expect(res).toBe(true);
      });

    it('Should return true because user extends userRoot',
      async () => {
        const res = (await rbacService.getRole('user')).can('permission4@create');
        expect(res).toBe(true);
      });

    it('Should return false because deep extends dont work',
      async () => {
        const res = (await rbacService.getRole('admin')).can('permission4@create');
        expect(res).toBe(false);
      });

  });

  describe('Filters', () => {

    it('Should return true because admin has the custom filter permission3@filter1',
      async () => {
        const filter = new ParamsFilter();
        filter.setParam('filter1', true);
        const res = (await rbacService.getRole('admin', filter)).can(
          'permission3@filter1',
        );
        expect(res).toBe(true);
      });

    it('Should return false because admin has the custom filter ' +
      'permission3@filter1 permission3@filter1',
      async () => {
        const filter = new ParamsFilter();
        filter
          .setParam('filter1', true)
          .setParam('filter2', false);
        const res = (await rbacService.getRole('admin', filter)).can(
          'permission3@filter2',
          'permission3@filter1',
        );
        expect(res).toBe(false);
      });

    it('Should return false because  of admin has the custom filter3 doesnt exist',
      async () => {
        const filter = new ParamsFilter();
        filter.setParam('filter1', true)
          .setParam('filter2', true)
          .setParam('filter3', true);

        const res = (await rbacService.getRole('admin', filter)).can(
          'permission3@filter2',
          'permission3@filter1',
          'permission3@filter3',
        );

        expect(res).toBe(false);
      });

      describe('Async', () => {

        it('Should return true because admin has the custom filter permission5@asyncFilter1',
          async () => {
            const filter = new ParamsFilter();
            filter.setParam('asyncFilter1', true);
            const res = await (await rbacService.getRole('admin', filter)).canAsync(
              'permission5@asyncFilter1',
            );
            expect(res).toBe(true);
          });

        it('Should return false because admin has the custom filter ' +
          'permission3@filter1 permission3@filter1',
          async () => {
            const filter = new ParamsFilter();
            filter
              .setParam('asyncFilter1', true)
              .setParam('asyncFilter2', false);
            const res = await (await rbacService.getRole('admin', filter)).canAsync(
              'permission5@asyncFilter2',
              'permission5@asyncFilter1',
            );
            expect(res).toBe(false);
          });

        it('Should return false because  of admin has the custom asyncFilter3 doesnt exist',
          async () => {
            const filter = new ParamsFilter();
            filter.setParam('asyncFilter1', true)
              .setParam('asyncFilter2', true)
              .setParam('asyncFilter3', true);

            const res = (await rbacService.getRole('admin', filter)).can(
              'permission5@asyncFilter2',
              'permission5@asyncFilter1',
              'permission5@asyncFilter3',
            );

            expect(res).toBe(false);
          });

      });

  });

  afterAll(async () => {
    await app.close();
  });
});
