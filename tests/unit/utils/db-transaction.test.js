const { setupTests } = require('../../set-up');
const {
  withTransaction,
  shouldRetryTransaction,
  ISOLATION_LEVELS,
} = require('../../../src/utils/db-transaction');

describe('Database Transaction Utilities', () => {
  let expect;

  before(async () => {
    ({ expect } = await setupTests());
  });

  describe('withTransaction', () => {
    it('should execute operations within a transaction and commit on success', async () => {
      let transactionPassed = null;

      const result = await withTransaction(async (transaction) => {
        transactionPassed = transaction;
        expect(transaction).to.have.property('id');
        return 'success';
      });

      expect(result).to.equal('success');
      expect(transactionPassed).to.not.equal(null);
    });

    it('should rollback transaction on error and re-throw', async () => {
      const testError = new Error('Test error');

      try {
        await withTransaction(async () => {
          throw testError;
        });

        // Should not reach here
        expect.fail('Expected transaction to throw error');
      } catch (error) {
        expect(error).to.equal(testError);
      }
    });

    it('should support custom isolation levels', async () => {
      const result = await withTransaction(async (transaction) => {
        expect(transaction.options.isolationLevel).to.not.equal(undefined);
        return 'isolated';
      }, { isolationLevel: ISOLATION_LEVELS.SERIALIZABLE });

      expect(result).to.equal('isolated');
    });
  });

  describe('shouldRetryTransaction', () => {
    it('should return true for retryable connection errors', () => {
      const connectionError = new Error('Connection refused');
      connectionError.name = 'SequelizeConnectionRefusedError';

      expect(shouldRetryTransaction(connectionError)).to.equal(true);
    });

    it('should return true for timeout errors', () => {
      const timeoutError = new Error('Operation timed out');
      timeoutError.original = { code: 'ETIMEDOUT' };

      expect(shouldRetryTransaction(timeoutError)).to.equal(true);
    });

    it('should return false for non-retryable errors', () => {
      const validationError = new Error('Validation failed');

      expect(shouldRetryTransaction(validationError)).to.equal(false);
    });
  });

  describe('ISOLATION_LEVELS', () => {
    it('should provide all standard isolation levels', () => {
      expect(ISOLATION_LEVELS).to.have.property('READ_UNCOMMITTED');
      expect(ISOLATION_LEVELS).to.have.property('READ_COMMITTED');
      expect(ISOLATION_LEVELS).to.have.property('REPEATABLE_READ');
      expect(ISOLATION_LEVELS).to.have.property('SERIALIZABLE');
    });
  });
});
