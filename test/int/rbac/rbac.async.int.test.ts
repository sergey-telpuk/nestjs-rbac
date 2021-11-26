import { INestApplication } from '@nestjs/common';
import { RBAcModule } from '../../../src/rbac.module';
import { RbacService } from '../../../src/services/rbac.service';
import { Test } from '@nestjs/testing';
import { ParamsFilter } from '../../../src/params-filter/params.filter';
import { AsyncService } from '../../fixtures/services/async.service';
import { RbacCache } from '../../../src/cache/rbac.cache';

jest.setTimeout(30000);

describe('RBAC async service', () => {
  let app: INestApplication;
  let rbacService: RbacService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        RBAcModule.useCache(RbacCache, { KEY: 'RBAC', TTL: 400 }).forDynamic(
          AsyncService,
        ),
      ],
      controllers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    rbacService = moduleFixture.get(RbacService);

    await app.init();
  });

  describe('Permission', () => {
    it('Should return true because admin has permissions for permission1@create', async () => {
      const res = (await rbacService.getRole('admin')).canAsync('permission1@create');
      expect(res).toBe(true);
    });

    it("Should return false because user hasn't permissions for permission1@update", async () => {
      const res = (await rbacService.getRole('user')).canAsync('permission1@update');
      expect(res).toBe(false);
    });

    it('Should return true because user has permissions for permission1@create', async () => {
      const res = (await rbacService.getRole('user')).canAsync('permission1@create');
      expect(res).toBe(true);
    });

    it('Should return true because user has at least 1 permission for permission1@create', async () => {
      const res = await (await rbacService.getRole('user')).anyAsync(
        ['permission1@create'],
        ['permission1@update'],
      );
      expect(res).toBe(true);
    });

    it('Should return false because user does not exist permissions for both permission1@update and permission1@delete', async () => {
      const res = await (await rbacService.getRole('user')).anyAsync(
        ['permission1@update'],
        ['permission1@delete'],
      );
      expect(res).toBe(false);
    });
  });

  describe('Extends', () => {
    it('Should return true because admin extends user', async () => {
      const res = (await rbacService.getRole('admin')).canAsync('permission2@update');
      expect(res).toBe(true);
    });

    it('Should return true because user extends userRoot', async () => {
      const res = (await rbacService.getRole('user')).canAsync('permission4@create');
      expect(res).toBe(true);
    });

    it('Should return false because deep extends dont work', async () => {
      const res = (await rbacService.getRole('admin')).canAsync('permission4@create');
      expect(res).toBe(false);
    });

    it('Should return true because at least 1 permission extended by user to admin', async () => {
      const res = await (await rbacService.getRole('admin')).anyAsync(
        ['permission2@update'],
        ['permission4@create'],
      );
      expect(res).toBe(true);
    });

    it('Should return false because neither of permissions extended to admin', async () => {
      const res = await (await rbacService.getRole('admin')).anyAsync(
        ['permission4@create'],
        ['permission4@update'],
      );
      expect(res).toBe(false);
    });
  });

  describe('Filters', () => {
    it('Should return true because admin has the custom filter permission5@ASYNC_filter1', async () => {
      const filter = new ParamsFilter();
      filter.setParam('ASYNC_filter1', true);
      const res = await (await rbacService.getRole('admin', filter)).canAsync(
        'permission5@ASYNC_filter1',
      );
      expect(res).toBe(true);
    });

    it(
      'Should return false because admin has the custom filter ' +
        'permission3@filter1 permission3@filter1',
      async () => {
        const filter = new ParamsFilter();
        filter.setParam('ASYNC_filter1', true).setParam('ASYNC_filter2', false);
        const res = await (await rbacService.getRole('admin', filter)).canAsync(
          'permission5@ASYNC_filter2',
          'permission5@ASYNC_filter1',
        );
        expect(res).toBe(false);
      },
    );

    it('Should return false because admin has the custom filter3 doesnt exist', async () => {
      const filter = new ParamsFilter();
      filter
        .setParam('ASYNC_filter1', true)
        .setParam('ASYNC_filter2', true)
        .setParam('filter3', true);

      const res = await (await rbacService.getRole('admin', filter)).canAsync(
          'permission5@ASYNC_filter2',
          'permission5@ASYNC_filter1',
        'permission3@filter3',
      );

      expect(res).toBe(false);
    });

    it('Should return true because admin has at least 1 filter permission3@filter1', async () => {
      const filter = new ParamsFilter();
      filter.setParam('ASYNC_filter1', true).setParam('ASYNC_filter2', false);
      const res = await (await rbacService.getRole('admin', filter)).anyAsync(
        ['permission5@ASYNC_filter1'],
        ['permission5@ASYNC_filter2'],
      );
      expect(res).toBe(true);
    });

    it('Should return false because admin has neither of the permission filters', async () => {
      const filter = new ParamsFilter();
      filter.setParam('ASYNC_filter1', false).setParam('ASYNC_filter2', false);
      const res = await (await rbacService.getRole('admin', filter)).anyAsync(
        ['permission3@ASYNC_filter1'],
        ['permission3@ASYNC_filter2'],
      );
      expect(res).toBe(false);
    });

    describe('Async', () => {
      it('Should return true because admin has the custom filter permission5@ASYNC_filter1', async () => {
        const filter = new ParamsFilter();
        filter.setParam('ASYNC_filter1', true);
        const res = await (await rbacService.getRole('admin', filter)).canAsync(
          'permission5@ASYNC_filter1',
        );
        expect(res).toBe(true);
      });

      it('Should return true because admin has at least 1 custom filter permission5@ASYNC_filter1', async () => {
        const filter = new ParamsFilter();
        filter.setParam('ASYNC_filter1', true).setParam('ASYNC_filter2', false);
        const res = await (await rbacService.getRole('admin', filter)).anyAsync(
          ['permission5@ASYNC_filter1'],
          ['permission5@ASYNC_filter2'],
        );
        expect(res).toBe(true);
      });

      it(
        'Should return false because admin has the custom filter ' +
          'permission3@filter1 permission3@filter1',
        async () => {
          const filter = new ParamsFilter();
          filter.setParam('ASYNC_filter1', true).setParam('ASYNC_filter2', false);
          const res = await (
            await rbacService.getRole('admin', filter)
          ).canAsync('permission5@ASYNC_filter2', 'pewrmission5@ASYNC_filter1');
          expect(res).toBe(false);
        },
      );

      it('Should return false because admin has neither of the custom permission', async () => {
        const filter = new ParamsFilter();
        filter.setParam('ASYNC_filter1', false).setParam('ASYNC_filter2', false);
        const res = await (await rbacService.getRole('admin', filter)).anyAsync(
          ['permission5@ASYNC_filter2'],
          ['permission5@ASYNC_filter1'],
        );
        expect(res).toBe(false);
      });

      it('Should return false because  of admin has the custom asyncFilter3 doesnt exist', async () => {
        const filter = new ParamsFilter();
        filter
          .setParam('ASYNC_filter1', true)
          .setParam('ASYNC_filter2', true)
          .setParam('asyncFilter3', true);

        const res = (await rbacService.getRole('admin', filter)).canAsync(
          'permission5@ASYNC_filter2',
          'permission5@ASYNC_filter1',
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
