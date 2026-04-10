import { expect, test } from '@playwright/test';
import { loginAsOperator, pauseForDemo } from './utils/demo-helpers';

const inventoryLotsApi = /http:\/\/localhost:3001\/.*inventory-lots.*/;
const inventoryTransactionsApi =
  /http:\/\/localhost:3001\/.*inventory-transactions.*/;
const productionBatchesApi = /http:\/\/localhost:3001\/.*production-batches.*/;

test.describe('Operator workflow', () => {
  test('US02 - operator receives lot and creates receipt transaction in stock-in', async ({
    page,
  }) => {
    let inventoryLotCreated = false;
    let receiptTransactionCreated = false;

    await page.route(inventoryLotsApi, async (route) => {
      const request = route.request();
      if (request.method() === 'OPTIONS') {
        await route.fulfill({
          status: 204,
          headers: {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'access-control-allow-headers': '*',
          },
          body: '',
        });
        return;
      }

      if (request.method() === 'POST') {
        inventoryLotCreated = true;

        const payload = request.postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            ...payload,
            status: 'Quarantine',
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.route(inventoryTransactionsApi, async (route) => {
      const request = route.request();
      if (request.method() === 'OPTIONS') {
        await route.fulfill({
          status: 204,
          headers: {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'access-control-allow-headers': '*',
          },
          body: '',
        });
        return;
      }

      if (request.method() === 'POST') {
        receiptTransactionCreated = true;

        const payload = request.postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            ...payload,
            transaction_id: 'tx-op-receipt-001',
          }),
        });
        return;
      }

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            message: 'ok',
            payload: {
              data: [],
              pagination: {
                page: 1,
                limit: 20,
                total: 0,
                pages: 1,
              },
            },
          }),
        });
        return;
      }

      await route.continue();
    });

    await loginAsOperator(page);

    await page.goto('/operator/stock-in');
    await expect(page.getByRole('heading', { name: 'Stock In' })).toBeVisible();

    const fillByLabel = async (label: string, value: string) => {
      const formItem = page
        .locator('.ant-form-item')
        .filter({ has: page.locator('label', { hasText: new RegExp(`^${label}$`) }) });
      await formItem.locator('input').first().fill(value);
    };

    await fillByLabel('Lot ID', 'lot-operator-0001');
    await fillByLabel('Material ID', 'mat-operator-001');
    await fillByLabel('Manufacturer', 'ACME Pharma');
    await fillByLabel('Manufacturer Lot', 'MFG-20260403');
    await fillByLabel('Supplier', 'Supplier A');
    await fillByLabel('Quantity', '10');
    await fillByLabel('Unit', 'kg');
    await fillByLabel('Storage Location', 'WH-A-01');
    await fillByLabel('Expiration Date', '2028-04-03');
    await fillByLabel('Reference Number', 'PO-OP-001');

    await page
      .locator('.ant-form-item')
      .filter({ has: page.locator('label', { hasText: 'Notes' }) })
      .locator('textarea')
      .fill('Operator stock-in test');

    await page.getByRole('button', { name: 'Confirm Stock In' }).click();

    expect(inventoryLotCreated).toBeTruthy();
    expect(receiptTransactionCreated).toBeTruthy();

    await expect(
      page.locator('.ant-message-notice-content').filter({
        hasText: 'Stock-in completed and receipt transaction created',
      }),
    ).toBeVisible({ timeout: 15000 });

    await pauseForDemo(page);
  });

  test('US05 - operator views production batches and filters by status', async ({
    page,
  }) => {
    const requests: string[] = [];

    await page.route(productionBatchesApi, async (route) => {
      const request = route.request();
      if (request.method() === 'OPTIONS') {
        await route.fulfill({
          status: 204,
          headers: {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'access-control-allow-headers': '*',
          },
          body: '',
        });
        return;
      }

      const url = new URL(request.url());

      requests.push(url.search);

      const status = url.searchParams.get('status');
      const data =
        status === 'Complete'
          ? [
              {
                batch_id: 'batch-op-002',
                batch_number: 'BATCH-OP-002',
                product_id: 'prod-002',
                batch_size: 500,
                unit_of_measure: 'pcs',
                status: 'Complete',
                manufacture_date: '2026-04-01T00:00:00.000Z',
                expiration_date: '2028-04-01T00:00:00.000Z',
              },
            ]
          : [
              {
                batch_id: 'batch-op-001',
                batch_number: 'BATCH-OP-001',
                product_id: 'prod-001',
                batch_size: 1000,
                unit_of_measure: 'pcs',
                status: 'In Progress',
                manufacture_date: '2026-04-01T00:00:00.000Z',
                expiration_date: '2028-04-01T00:00:00.000Z',
              },
              {
                batch_id: 'batch-op-002',
                batch_number: 'BATCH-OP-002',
                product_id: 'prod-002',
                batch_size: 500,
                unit_of_measure: 'pcs',
                status: 'Complete',
                manufacture_date: '2026-04-01T00:00:00.000Z',
                expiration_date: '2028-04-01T00:00:00.000Z',
              },
            ];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data,
          pagination: {
            page: 1,
            limit: 10,
            total: data.length,
            totalPages: 1,
          },
        }),
      });
    });

    await loginAsOperator(page);

    await page.goto('/operator/production-batches');
    await expect(page.getByRole('heading', { name: 'Production Batches' })).toBeVisible();
    await expect(page.getByText('BATCH-OP-001')).toBeVisible();
    await expect(page.getByText('BATCH-OP-002')).toBeVisible();

    await page.getByRole('button', { name: 'Complete' }).click();

    await expect(page.getByText('BATCH-OP-002')).toBeVisible();
    await expect(page.getByText('BATCH-OP-001')).not.toBeVisible();
    expect(requests.some((q) => q.includes('status=Complete'))).toBeTruthy();

    await pauseForDemo(page);
  });

  test('US27 - operator performs inventory audit and applies adjustment transaction', async ({
    page,
  }) => {
    let lotUpdated = false;
    let adjustmentTransactionCreated = false;

    await page.route(inventoryLotsApi, async (route) => {
      const request = route.request();

      if (request.method() === 'OPTIONS') {
        await route.fulfill({
          status: 204,
          headers: {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'access-control-allow-headers': '*',
          },
          body: '',
        });
        return;
      }

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              lot_id: 'lot-audit-001',
              material_id: 'mat-audit-001',
              quantity: 10,
              unit_of_measure: 'kg',
              status: 'Accepted',
            },
          ]),
        });
        return;
      }

      await route.continue();
    });

    await page.route(/http:\/\/localhost:3001\/inventory-lots\/.+/, async (route) => {
      const request = route.request();
      if (request.method() === 'OPTIONS') {
        await route.fulfill({
          status: 204,
          headers: {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'access-control-allow-headers': '*',
          },
          body: '',
        });
        return;
      }

      if (request.method() === 'PUT') {
        lotUpdated = true;

        const payload = request.postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            lot_id: 'lot-audit-001',
            material_id: 'mat-audit-001',
            quantity: payload.quantity,
            unit_of_measure: 'kg',
            status: 'Accepted',
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.route(inventoryTransactionsApi, async (route) => {
      const request = route.request();
      if (request.method() === 'OPTIONS') {
        await route.fulfill({
          status: 204,
          headers: {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'access-control-allow-headers': '*',
          },
          body: '',
        });
        return;
      }

      if (request.method() === 'POST') {
        adjustmentTransactionCreated = true;

        const payload = request.postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            ...payload,
            transaction_id: 'tx-audit-001',
          }),
        });
        return;
      }

      await route.continue();
    });

    await loginAsOperator(page);

    await page.goto('/operator/audit');
    await expect(page.getByRole('heading', { name: 'Inventory Audit' })).toBeVisible();

    const countedInput = page.locator('input[role="spinbutton"]').first();
    await countedInput.fill('9');

    await page.getByRole('button', { name: 'Apply Audit Adjustments' }).click();

    await expect(
      page.locator('.ant-message-notice-content').filter({
        hasText: 'Applied 1 inventory adjustments',
      }),
    ).toBeVisible();

    expect(lotUpdated).toBeTruthy();
    expect(adjustmentTransactionCreated).toBeTruthy();

    await pauseForDemo(page);
  });
});
