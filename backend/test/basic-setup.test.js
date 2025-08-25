import { expect } from '@jest/globals';

describe('Test Setup Verification', () => {
    it('Should have global test users available', () => {
        console.log('Global test users:', Object.keys(global.testUsers || {}));
        expect(global.testUsers).toBeDefined();
    });

    it('Should be able to run a basic test', () => {
        expect(1 + 1).toBe(2);
    });
});
