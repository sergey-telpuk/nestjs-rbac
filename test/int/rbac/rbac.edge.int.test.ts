import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { RBAcModule } from '../../../src/rbac.module';
import { RbacService } from '../../../src/services/rbac.service';
import { StorageRbacService } from '../../../src/services/storage.rbac.service';
import { RbacExceptions } from '../../../src/exceptions/rbac.exceptions';
import { RBAC } from '../../fixtures/storage';

describe('RBAC edge cases', () => {
    let app: INestApplication;
    let rbacService: RbacService;
    let storage: StorageRbacService;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [RBAcModule.forRoot(RBAC)],
            controllers: [],
        }).compile();

        app = moduleFixture.createNestApplication();
        rbacService = moduleFixture.get(RbacService);
        storage = moduleFixture.get(StorageRbacService);

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Unknown role', () => {
        it('throws RbacExceptions for an unknown role', async () => {
            await expect(rbacService.getRole('ghost')).rejects.toBeInstanceOf(RbacExceptions);
        });

        it('throws RbacExceptions when role is undefined', async () => {
            await expect(
                rbacService.getRole(undefined as unknown as string),
            ).rejects.toBeInstanceOf(RbacExceptions);
        });
    });

    describe('Empty permission lists', () => {
        it('can() with no permissions returns false', async () => {
            const role = await rbacService.getRole('admin');
            expect(role.can()).toBe(false);
        });

        it('canAsync() with no permissions returns false', async () => {
            const role = await rbacService.getRole('admin');
            await expect(role.canAsync()).resolves.toBe(false);
        });

        it('any() with no groups returns false', async () => {
            const role = await rbacService.getRole('admin');
            expect(role.any()).toBe(false);
        });
    });

    describe('Internal grant memoisation', () => {
        it('returns the same parsed grant array reference for the same storage', async () => {
            const first = await storage.getGrant('admin');
            const second = await storage.getGrant('admin');
            expect(second).toBe(first);
        });

        it('resolves the same filter map instance for the same storage', async () => {
            const a = await storage.getFilters();
            const b = await storage.getFilters();
            expect(b).toBe(a);
        });
    });

    describe('Unknown permission', () => {
        it('returns false when permission is not granted at all', async () => {
            const role = await rbacService.getRole('user');
            expect(role.can('does-not-exist')).toBe(false);
        });

        it('returns false when permission@action is not granted', async () => {
            const role = await rbacService.getRole('user');
            expect(role.can('permission2@nope')).toBe(false);
        });
    });
});
