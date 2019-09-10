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

  it('Should return true because admin has permissions for permission1@create',
    () => {
      const res = rbacService.getRole('admin').can('permission1@create');
      expect(res).toBe(true);
    });

  it('Should return true because admin extends user',
    () => {
      const res = rbacService.getRole('admin').can('permission2@update');
      expect(res).toBe(true);
    });

  it('Should return false because user hasn\'t permissions for permission2@update',
    () => {
      const res = rbacService.getRole('user').can('permission1@update');
      expect(res).toBe(false);
    });

  it('Should return true because admin has the custom filter permission3@filter1',
    () => {
      const filter = new ParamsFilter();
      filter.setParams('filter1', true);
      const res = rbacService.getRole('admin', filter).can(
        'permission3@filter1',
      );
      expect(res).toBe(true);
    });

  it('Should return false because admin has the custom filter ' +
    'permission3@filter1 permission3@filter1', () => {
    const filter = new ParamsFilter();
    filter.setParams('filter1', true)
      .setParams('filter2', false);
    const res = rbacService.getRole('admin', filter).can(
      'permission3@filter2',
      'permission3@filter1',
    );
    expect(res).toBe(false);
  });

  it('Should return false because  of admin has the custom filter3 doesnt exist',
    () => {
      const filter = new ParamsFilter();
      filter.setParams('filter1', true)
        .setParams('filter2', true)
        .setParams('filter3', true);

      const res = rbacService.getRole('admin', filter).can(
        'permission3@filter2',
        'permission3@filter1',
        'permission3@filter3',
      );

      expect(res).toBe(false);
    });

  afterAll(async () => {
    await app.close();
  });
});
