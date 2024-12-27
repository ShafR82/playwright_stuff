import { test, expect } from '@playwright/test';

test('should create a bug report', async ( { request} ) => {

  const newIssue = await request.post('/repos/ShafR82/hello-word/issues', {
    data: {
        title: '[Bug] report 1',
        body: 'False Bug - just testing the API via Playwright',
    }
  });

  console.log(newIssue.status());

  expect(newIssue.ok()).toBeTruthy();
});