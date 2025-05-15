import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubscriptionTransactions1720000000000
  implements MigrationInterface
{
  name = 'CreateSubscriptionTransactions1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`subscription_transactions\` (
        \`id\` varchar(36) NOT NULL,
        \`userId\` varchar(36) NOT NULL,
        \`subscriptionType\` varchar(255) NOT NULL,
        \`amount\` decimal(10,2) NOT NULL,
        \`paymentMethod\` varchar(255) NOT NULL,
        \`transactionDate\` datetime NOT NULL,
        \`startDate\` datetime NOT NULL,
        \`endDate\` datetime NOT NULL,
        \`status\` enum('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
        \`notes\` text NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      ALTER TABLE \`subscription_transactions\`
      ADD CONSTRAINT \`FK_subscription_transactions_users\`
      FOREIGN KEY (\`userId\`)
      REFERENCES \`users\`(\`id\`)
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`subscription_transactions\` DROP FOREIGN KEY \`FK_subscription_transactions_users\`
    `);
    await queryRunner.query(`DROP TABLE \`subscription_transactions\``);
  }
}
